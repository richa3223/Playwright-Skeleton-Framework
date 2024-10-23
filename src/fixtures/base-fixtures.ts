//Playwright fixtures requires empty objects to be passed in as a param, hence the disable of no-empty-pattern
/* eslint-disable no-empty-pattern */

import CONFIG from '@config/configManager';
import type { TestInfo } from '@playwright/test';
import { test as baseTest } from '@playwright/test';
import { WireMockClient } from '@wiremock/wiremock-client';
import { getLogger } from 'src/logger-config';
import type { ZodType } from 'zod';

//Initialize a logger for this file
const logger = getLogger();

//Custom assertions - please note that 'any' types must be cast to unknown to keep the Typescript compiler happy with Playwright's 'expect' type.
export const expect = baseTest.expect.extend({
  //Validate API responses against their schemas
  async toMatchSchema(received: unknown, expected: ZodType<unknown>) {
    let prettyReceived: string;

    //Account for promises that may not have been awaited
    if (received instanceof Promise) {
      received = await received;
    }

    try {
      //Parse as json - if this fails, schema validation cannot occur. If it passes, it makes for a prettier schema validation failure message, should the schema parsing fail.
      prettyReceived = JSON.stringify(received, null, 2);
    } catch (e) {
      return {
        message: () => `The contents is not valid json.\n\nContents:\n${received}\n\nError:\n${e}`,
        pass: false,
      };
    }

    try {
      expected.parse(received);
      return {
        message: () => 'Passed',
        pass: true,
      };
    } catch (e) {
      return {
        message: () =>
          `The contents did not match the expected schema.\n\nContents:\n${prettyReceived}\n\nValidation failure:\n${e}`,
        pass: false,
      };
    }
  },
});

//Extend default Playwright functionality
export const test = baseTest
  .extend<{ testInfo: TestInfo }>({
    testInfo: [
      async ({}, use, testInfo) => {
        /* Enforcement of test title syntax 
        The title must be in the format: 'Test Title | @JIRA-0001 @JIRA-0002 @nonJiraTag1' */
        const titleAssertionErrorText = `Invalid test title: Please ensure tests are tagged appropriately. The tags must start with a corresponding JIRA ID(s) before using other tags and only use a single pipe to separate the test file from the tags, for example: 'This is the scenario | @JIRA-0001 @queryService @devRegression'`;
        const titleRegex = /^[^|]+ \|( @JIRA-\d+)+(( @[a-zA-Z0-9]+))*/;

        //Non compliant test titles will be marked as failed, but will continue to execute
        expect.soft(testInfo.title, titleAssertionErrorText).toMatch(titleRegex);
        const testId = test.info().testId;

        const testIdWithRetryKey =
          test.info().retry === 0 ? 'testId' : `testId (retry ${test.info().retry})`;

        /* Logs test title (without metadata for readability) and testId of tests and whether it's a retry for debugging usage
        Note that Playwright will reuse the same testId for each retry */
        logger.info(`"${testInfo.title.split('|')[0].trim()}" | ${testIdWithRetryKey}: ${testId}`);

        /* Filter all test tags for exclusively JIRA tickets, and append them as 'requirements' to the test
        This is to be used with automated test tracibility/reporting solutions, as you would not want to include non-JIRA tags in the report */
        if (testInfo.title.match(titleRegex)) {
          const testMetadata = testInfo.title.split('|')[1];
          const jiraTags = testMetadata.match(/JIRA-\d+/g);
          //Remove duplicate tags
          const matchesSet = [...new Set(jiraTags)];
          if (matchesSet)
            matchesSet.forEach((tag) => {
              test.info().annotations.push({ type: 'requirements', description: tag });
            });
        }
        await use(testInfo);
      },
      //Setting auto to true allows each test to use this fixture implicitly rather than setting it explicitly in each test
      { auto: true },
    ],
  })

  // Automatic cleardown of mocks created by tests
  .extend<{ autoTearDownMappings: void }>({
    autoTearDownMappings: [
      async ({}, use, testInfo) => {
        /* Note that config is a json import, so both properties below are true booleans, rather than truthy/falsey evaluations. See: https://www.sitepoint.com/javascript-truthy-falsy
        Both values must be 'true' to trigger the teardown. See: https://docs.oracle.com/html/E79061_01/Content/Reference/Truth_tables.htm */
        if (CONFIG.test.wiremock.enabled && CONFIG.test.wiremock.autoTearDownMappings) {
          await use();
          logger.info(`clearing stubmapping for testId ${testInfo.testId}`);
          await WireMockClient.removeStubMappingByTestId(testInfo.testId);
        } else {
          await use();
        }
      },
      { auto: true },
    ],
  });
