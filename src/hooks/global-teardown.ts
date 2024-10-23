import CONFIG from '@config/configManager';
import { WireMockClient } from '@wiremock/wiremock-client';
import { getLogger } from 'src/logger-config';
const logger = getLogger();

async function globalTeardown() {
  logger.info('Running global teardown...');

  // Wiremock and automatic teardowns must be enabled in config for the below functionality to be used
  if (CONFIG.test.wiremock.enabled && CONFIG.test.wiremock.autoTearDownMappings) {
    // Delete all remaining stubmappings tagged with the test run identifier
    await WireMockClient.getInstance().mappings.removeByMetaData({
      matchesJsonPath: `$[?(@.tri == '${process.env.TRI}')]`,
    });

    // Remove request (monitoring) history from Wiremock
    await WireMockClient.getInstance().requests.deleteAllRequests();

    // Ensure that the cleardown of stubmappings is correctly handled
    await areStartingNumberOfStubMappingsPresent();
  }
  logger.info('Teardown complete');
}

// Rather than throw an error right at the end of the test run, the below will warn users that whilst this run was valid, subsequent runs may not be.
async function areStartingNumberOfStubMappingsPresent() {
  const mappingsLength = (await WireMockClient.getInstance().mappings.getAllMappings()).mappings
    ?.length;

  if (!mappingsLength && process.env.WIREMOCK_STUBMAPPING_COUNT !== '0') {
    logger.warn(
      `Counted ${mappingsLength} stubmappings at end of test when ${process.env.WIREMOCK_STUBMAPPING_COUNT} expected - test conditions have not been sanitised.`
    );
  }

  if (!process.env.WIREMOCK_STUBMAPPING_COUNT) {
    logger.warn(
      'WIREMOCK_STUBMAPPING_COUNT has not been defined - cannot ensure that mocks have been effectively cleared down'
    );
  }

  if (mappingsLength && process.env.WIREMOCK_STUBMAPPING_COUNT) {
    if (mappingsLength !== parseInt(process.env.WIREMOCK_STUBMAPPING_COUNT)) {
      logger.warn(
        `Counted ${mappingsLength} stubmappings at end of test when ${process.env.WIREMOCK_STUBMAPPING_COUNT} expected - test conditions have not been sanitised.`
      );
    }
  }
}

export default globalTeardown;
