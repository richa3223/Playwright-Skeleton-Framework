import CONFIG from '@config/configManager';

import { WireMockClient } from '@wiremock/wiremock-client';
import type { UUID } from 'crypto';
import { getLogger } from 'src/logger-config';
import type { RequestPattern } from 'wiremock-rest-client/dist/model/request-pattern.model';
import type { ResponseDefinition } from 'wiremock-rest-client/dist/model/response-definition.model';
import type { StubMapping } from 'wiremock-rest-client/dist/model/stub-mapping.model';

const logger = getLogger();

/* This builder facilitates the creation of wiremock stubmappings, as a wrapper around the wiremock-rest-client.
/* This builder facilitates the creation of wiremock stubmappings as a wrapper around the wiremock-rest-client.
Use of this builder ensures that the stubmapping file contains all of the information a stubmapping should have, and provides
flexibility to modify all mapping (e.g. with the addition of additional metadata) across all tests.
For more information on wiremock & stubmappings: https://wiremock.org/docs/stubbing/ */
export class StubMappingBuilder {
  private stubMapping: StubMapping;

  constructor(testId: string) {
    this.stubMapping = {
      priority: 5, // All requests should be priority 5 - see the mocks-exemplar readme for details.
      metadata: {
        tri: CONFIG.test.TRI,
        testId: testId,
        source: CONFIG.test.projectName,
      },
    };
  }

  setId(id: UUID): this {
    this.stubMapping.id = id;
    return this;
  }

  setUuid(uuid: UUID): this {
    this.stubMapping.uuid = uuid;
    return this;
  }

  setName(name: string): this {
    this.stubMapping.name = name;
    return this;
  }

  setRequest(request: RequestPattern): this {
    this.stubMapping.request = request;
    return this;
  }

  setResponse(response: ResponseDefinition): this {
    this.stubMapping.response = response;
    return this;
  }

  // Update can be used to append to an existing object, or overwrite only the existing properties provided by the argument
  updateResponse(response: ResponseDefinition): this {
    this.stubMapping.response = { ...this.stubMapping.response, response };
    this.stubMapping.response = response;
    return this;
  }

  setResponseProxyBaseUrl(proxyBaseUrl: string): this {
    this.stubMapping.response = { ...this.stubMapping.response };
    this.stubMapping.response.proxyBaseUrl = proxyBaseUrl;
    return this;
  }

  setResponseHeaders(headers: Record<string, unknown>) {
    this.stubMapping.response = { ...this.stubMapping.response };
    this.stubMapping.response.headers = headers;
    return this;
  }

  setResponseJsonBody(responseJsonBody: object) {
    this.stubMapping.response = { ...this.stubMapping.response };
    this.stubMapping.response.jsonBody = responseJsonBody;
    return this;
  }

  setResponseDelayMs(responseDelayMs: number) {
    this.stubMapping.response = { ...this.stubMapping.response };
    this.stubMapping.response.fixedDelayMilliseconds = responseDelayMs;
    return this;
  }

  setPersistent(persistent: boolean): this {
    this.stubMapping.persistent = persistent;
    return this;
  }

  setPriority(priority: number): this {
    this.stubMapping.priority = priority;
    return this;
  }

  setScenarioName(scenarioName: string): this {
    this.stubMapping.scenarioName = scenarioName;
    return this;
  }

  setRequiredScenarioState(requiredScenarioState: string): this {
    this.stubMapping.requiredScenarioState = requiredScenarioState;
    return this;
  }

  setNewScenarioState(newScenarioState: string): this {
    this.stubMapping.newScenarioState = newScenarioState;
    return this;
  }

  setPostServeActions(postServeActions: Record<string, unknown>): this {
    this.stubMapping.postServeActions = postServeActions;
    return this;
  }

  updateMetadata(metadata: Record<string, unknown>): this {
    this.stubMapping.metadata = { ...this.stubMapping.metadata, ...metadata };
    return this;
  }

  // Creates the stubmapping in Wiremock & returns it
  async build(): Promise<StubMapping> {
    const stubMapping = await WireMockClient.createMapping(this.stubMapping);
    logger.info(`Stubmapping created for TestId: '${stubMapping.metadata?.testId}'`);
    return stubMapping;
  }
}
