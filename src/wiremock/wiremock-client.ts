import CONFIG from '@config/configManager';
import { WireMockRestClient } from 'wiremock-rest-client';
import type { StubMapping } from 'wiremock-rest-client/dist/model/stub-mapping.model';
import { z } from 'zod';

/* This is a wrapper around the wiremock-rest-client package to facilitate the ease of handling
interactions with a wiremock service. The Playwright skeleton client offers additional functionality on top
of the wiremock-rest-client such as wrappers for common functions, the usage of types, and error handling. */

export class WireMockClient {
  private static instance: WireMockRestClient;

  public static getInstance(): WireMockRestClient {
    if (CONFIG.test.wiremock.enabled === false) {
      throw new Error(
        `WIREMOCK_ENABLED env var is not set to 'true', WiremockClient should not be utilised.`
      );
    }
    if (!WireMockClient.instance) {
      WireMockClient.instance = new WireMockRestClient(CONFIG.test.wiremock.baseUrl, {
        continueOnFailure: true,
      });
    }

    return WireMockClient.instance;
  }

  public static async containsTRIRelatedMappings() {
    const matchingStubMappings = (
      await this.getInstance().mappings.findByMetaData({
        matchesJsonPath: `$[?(@.tri == '${CONFIG.test.TRI}')]`,
      })
    ).mappings;
    return matchingStubMappings && matchingStubMappings.length > 0;
  }

  public static async removeStubMappingByTestId(testId: string) {
    await this.getInstance().mappings.removeByMetaData({
      matchesJsonPath: `$[?(@.testId == '${testId}')]`,
    });
  }

  // Wrapper to ensure tests are alerted when creating erroneous mappings
  public static async createMapping(stubMapping: StubMapping): Promise<StubMapping> {
    const wiremockResponse = await WireMockClient.getInstance().mappings.createMapping(stubMapping);
    try {
      return StubMappingSchema.parse(wiremockResponse);
    } catch (error) {
      // Logs the error response itself, instead of a less-helpful schema validation that would be thrown by the schema parsing function
      throw new Error(`Error response from Wiremock:\n${JSON.stringify(wiremockResponse)}`);
    }
  }

  /* The wiremock-rest-client is limited by it's lack of typed responses. The below is an extension of the wiremock rest client using high-level zod schemas 
  based on the Java library equivalent, to provide compile & runtime safety & ease request/response validation in tests.
  For usages of this, see `wiremock-proxy-example.spec.ts`. 
  Zod schemas below are based on: https://javadoc.io/static/com.github.tomakehurst/wiremock-jre8/2.35.2/com/github/tomakehurst/wiremock/verification/LoggedRequest.html */
  public static async getEventByTestId(testId: string): Promise<ServeEvent> {
    /* There are two options to get the event - find by ID (which is unknown) and getting all the events in wiremock & filtering.
    Unfortunately the ID cannot be known programatically, so the filtering approach is required. For this reason it is important to remove stubmappings & 
    wiremock request journal entries frequently, to avoid large responses & a sigificant memory utilisation within wiremock. */
    const requests = await this.getInstance().requests.getAllRequests();

    if (!requests.requests) {
      throw new Error(
        `No requests were found in the Wiremock request journal. Please check your StubMapping configuration.`
      );
    }

    const schemaValidatedServeEvents = ServeEventsParentSchema.parse(requests);

    const eventMatchingTestId = schemaValidatedServeEvents.requests.find(
      (request) => request.stubMapping.metadata?.testId === testId
    );
    if (!eventMatchingTestId) {
      throw new Error(`No events found for ${testId}`);
    }

    return ServeEventSchema.parse(eventMatchingTestId);
  }
}

const RequestSchema = z.object({
  url: z.string(),
  absoluteUrl: z.string(),
  method: z.string(),
  clientIp: z.string(),
  headers: z.record(z.string()).optional(),
  cookies: z.record(z.string()).optional(),
  formParams: z.record(z.string()).optional(),
  browserProxyRequest: z.boolean(),
  host: z.string(),
  port: z.number().optional(),
  protocol: z.string(),
  loggedDate: z.number(),
  loggedDateString: z.string(),
  body: z.string().optional(),
  bodyAsBase64: z.string().optional(),
  scheme: z.string(),
  queryParams: z.record(z.string()).optional(),
  remoteAddress: z.string().optional(),
  browserRemoteAddress: z.string().optional(),
  isMultipart: z.boolean().optional(),
  loggedDateStringFormatted: z.string().optional(),
});

const ResponseSchema = z.object({
  status: z.number(),
  headers: z.record(z.string()),
  bodyAsBase64: z.string(),
  body: z.string(),
});

const TimingSchema = z.object({
  addedDelay: z.number(),
  processTime: z.number(),
  responseSendTime: z.number(),
  serveTime: z.number(),
  totalTime: z.number(),
});

const StubMappingSchema = z.object({
  id: z.string(),
  request: z.record(z.any()),
  response: z.record(z.any()),
  uuid: z.string(),
  metadata: z
    .object({
      tri: z.string(),
      testId: z.string(),
      source: z.string(),
    })
    // Additional metadata may be present
    .and(z.record(z.any()))
    .optional(),
});

const SubEventsSchema = z.array(z.record(z.any()));

const ServeEventSchema = z.object({
  id: z.string(),
  request: RequestSchema,
  response: ResponseSchema,
  responseDefinition: z.record(z.any()),
  wasMatched: z.boolean(),
  timing: TimingSchema,
  subEvents: SubEventsSchema.optional(),
  stubMapping: StubMappingSchema,
});

const ServeEventsParentSchema = z.object({
  meta: z.object({
    total: z.number(),
  }),
  requests: z.array(ServeEventSchema),
  requestJournalDisabled: z.boolean().optional(),
});

export type ServeEvent = z.infer<typeof ServeEventSchema>;
