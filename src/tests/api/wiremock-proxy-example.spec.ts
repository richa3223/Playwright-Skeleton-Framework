import { expect } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { StubMappingBuilder } from '@wiremock/stubmapping-builder';
import { WireMockClient } from '@wiremock/wiremock-client';

test.describe('Wiremock as a proxy service | @wiremock @proxy @api', () => {
  test('Proxy a request through wiremock and validate the response via the proxy | @JIRA-179', async ({
    request,
  }, testInfo) => {
    /* This skip can be updated to reflect environment test tags where wiremock is expected/unexpected, rather than config. 
    E.g. process.env.ENVIRONMENT === 'SIT' could be used to skip wiremock tests in the SIT environment. */
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(CONFIG.test.wiremock.enabled === false, 'This test requires wiremock to be enabled.');
    const stubBuilder = new StubMappingBuilder(testInfo.testId);
    // Set up the proxy stub mapping. In this example, the proxy will capture 'POST' requests/responses intended for restful booker's authentication endpoint.
    await stubBuilder
      .setRequest({
        method: 'POST',
        urlPattern: `${CONFIG.api.restfulBooker.endpoints.auth}.*`,
        headers: {
          'x-request-id': {
            equalTo: `${testInfo.testId}`, // The x-request-id header (known as a trace/correlation ID) will ensure that this stubmapping can only be matched by the corresponding instance of the corresponding test
          },
        },
      })
      .setResponse({ proxyBaseUrl: `${CONFIG.api.restfulBooker.baseUrl}` })
      .build();

    /* Hit proxy with a request. With a UI test this could be an indirect trigger, E.g. clicking a 'submit' button to trigger the test apps restful call. 
      Remember that your UI application will need to be pointing towards the wiremock host, otherwise wiremock won't see any traffic! */
    const authResponse = await request.post(
      `${CONFIG.test.wiremock.baseUrl}${CONFIG.api.restfulBooker.endpoints.auth}`,
      {
        data: {
          username: CONFIG.api.restfulBooker.testUsers.admin.username,
          password: CONFIG.api.restfulBooker.testUsers.admin.password,
        },
        headers: { 'Content-Type': 'application/json', 'x-request-id': testInfo.testId }, // Remember to include the trace/correlation ID, else the correct stubmapping won't be matched
      }
    );

    // Validate the request performed - with a UI test this might be validated via a 'submitted' button being visible.
    await expect(authResponse).toBeOK();

    // Query wiremock for requests & responses corresponding to the proxy stubmapping
    const wiremockEvent = await WireMockClient.getEventByTestId(testInfo.testId);

    // Validate the request content - the mechanism for this largely depends on the context of the test, but consider the below examples
    expect(wiremockEvent.request.body).toBe(
      `{\"username\":\"${CONFIG.api.restfulBooker.testUsers.admin.username}\",\"password\":\"${CONFIG.api.restfulBooker.testUsers.admin.password}\"}`
    );
    expect(wiremockEvent.request.bodyAsBase64).toBe(
      'eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiJwYXNzd29yZDEyMyJ9'
    );
    expect(wiremockEvent.request.headers?.['x-request-id']).toBe(testInfo.testId);

    // Validate the response
    expect(wiremockEvent.response.body).toContain('token');
    expect(wiremockEvent.response.headers?.['Content-Type']).toBe(
      'application/json; charset=utf-8'
    );

    /* This will teardown the stubmapping and request history from the wiremock request journey. Teardowns such as these will help to keep your wiremock & test memory utilisation low! */
    await Promise.all([
      WireMockClient.getInstance().mappings.deleteMapping(wiremockEvent.id),
      WireMockClient.removeStubMappingByTestId(testInfo.testId),
    ]);
  });
});
