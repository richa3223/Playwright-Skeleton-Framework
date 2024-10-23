import CONFIG from '@config/configManager';
import { BookingBuilder } from '@data/builders/booking-builder';
import { CreateBookingResponseSchema } from '@data/models/bookings';
import { request, type APIRequestContext } from 'playwright-core';
import { test as BaseTest } from 'src/fixtures/base-fixtures';
import { getLogger } from 'src/logger-config';

const logger = getLogger();
//Extension of test fixture to allow for API tests to start with required data & objects
export const test = BaseTest.extend<{
  loginApiRequestContext: APIRequestContext;
  generatedBookingId: number;
}>({
  //Set up API context for all tests
  loginApiRequestContext: async ({ testInfo }, use) => {
    const loginApiRequestContext = await request.newContext({
      extraHTTPHeaders: {
        baseURL: CONFIG.api.restfulBooker.baseUrl,
        //Add testId to header where possible to trace requests in logs
        unusedHeader: testInfo.testId,
      },
    });
    await use(loginApiRequestContext);
  },

  // Fixture for generating random booking ID - by creating a booking
  generatedBookingId: async ({}, use) => {
    const requestUrl = `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`;
    const requestContents = {
      // Builds a random booking, using the builder
      data: new BookingBuilder().build(),
      headers: { 'Content-Type': 'application/json' },
    };

    // This adds the request for the generated booking ID to the report to support debugging
    logger.info(
      `Generating booking Id with '${requestUrl}' \nand contents of:\n${JSON.stringify(requestContents, null, 2)}`
    );

    const response = await (await request.newContext()).post(requestUrl, requestContents);

    // Setup is not a test, if it fails then we want to throw an error, rather than fail an assertion
    if (!response.ok()) {
      throw new Error(
        `Could not generate booking ID:\n${JSON.stringify(await response.json(), null, 2)}`
      );
    }

    const responseBody = await response.json();

    // This adds the response for the generated booking ID to the report to support debugging
    logger.info('Generated booking:\n' + JSON.stringify(responseBody, null, 2));
    await use(CreateBookingResponseSchema.parse(responseBody).bookingid); //Makes the generated bookingId available to the test
  },
});
