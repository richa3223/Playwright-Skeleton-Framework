import CONFIG from '@config/configManager';
import { request } from '@playwright/test';
import { WireMockClient } from '@wiremock/wiremock-client';
import { getLogger } from 'src/logger-config';

const logger = getLogger();

async function globalSetup() {
  // Log useful config info, as this allows users to see if any major config is incorrect at the start of execution
  logger.info(`Test run ID: ${CONFIG.test.TRI}`);
  logger.info(`Target environment: ${CONFIG.environment}`);
  logger.info(`Swag Labs Base URL: ${CONFIG.ui.swagLabs.baseUrl}`);
  logger.info(`Wikipedia base URL: ${CONFIG.ui.wikipedia.baseUrl}`);
  logger.info(`Accessibility autoscan enabled: ${CONFIG.test.accessibility.autoscanEnabled}`);
  logger.info(`Wiremock enabled: ${CONFIG.test.wiremock.enabled}`);

  if (CONFIG.test.wiremock.enabled) {
    logger.info(`Wiremock Base URL: ${CONFIG.test.wiremock.baseUrl}`);
    await checkForSanitisedMockState();
  }

  await waitForAppToBeReady(CONFIG.ui.swagLabs.baseUrl);

  logger.info('global setup complete.');
}

async function waitForAppToBeReady(appURL: string, maximumWaitInSeconds?: number): Promise<void> {
  if (!maximumWaitInSeconds) {
    maximumWaitInSeconds = CONFIG.test.maxWaitForHealthy;
  }

  const maximumWaitDurationInMs = maximumWaitInSeconds * 1000;
  const startTime = Date.now();
  const pollRateInMs = 10000;

  await (async () => {
    //Set up browser
    let appHealthy = false;

    //Start loop
    while (Date.now() - startTime < maximumWaitDurationInMs) {
      const apiRequestContext = await request.newContext();
      try {
        logger.info(`Checking readiness of ${appURL}...`);
        const clientResponse = apiRequestContext.get(appURL);
        appHealthy = (await clientResponse).status() === 200;
      } catch (e) {
        if (e instanceof Error) {
          logger.warn(e.message);
        } else {
          logger.error(`App is not ready to receive requests. Unknown error.`);
        }
      }
      if (appHealthy) {
        logger.info('App is ready to receive requests!');
        break;
      } else {
        logger.warn(
          `App is not ready to receive requests, waiting ${
            pollRateInMs / 1000
          } seconds before retrying. Elapsed time ${((Date.now() - startTime) / 1000).toFixed(
            1
          )} seconds, limit set to ${maximumWaitInSeconds} seconds.`
        );
        await delayInSeconds(pollRateInMs / 1000);
      }
    }

    if (!appHealthy) {
      throw new Error(
        `App is not ready to receive requests. Maximum wait time of ${maximumWaitInSeconds} seconds exceeded.`
      );
    }
  })();
}

function delayInSeconds(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay * 1000));
}

async function checkForSanitisedMockState() {
  await waitForAppToBeReady(
    `${CONFIG.test.wiremock.baseUrl}${CONFIG.test.wiremock.endpoints.health}`
  );
  // If stubmappings exist with the test run identifier tagged, it is not a clean test run
  if (await WireMockClient.containsTRIRelatedMappings()) {
    throw new Error(
      `Existing stubmappings have been found corresponding to the test run identifier '${process.env.TRI}' that may compromise test validity, ensure these are purged prior to test execution.`
    );
  }
  /* Count number of mappings at the start of execution to compare to those observed in teardown 
  if the numbers are not equal, not all mocks created by the tests have been cleared down */
  process.env.WIREMOCK_STUBMAPPING_COUNT =
    (await WireMockClient.getInstance().mappings.getAllMappings()).mappings?.length.toString() ??
    '0';
}

export default globalSetup;
