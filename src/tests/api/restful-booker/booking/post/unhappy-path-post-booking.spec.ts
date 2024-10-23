import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BookingBuilder } from '@data/builders/booking-builder';
import type { BaseBooking } from '@data/models/bookings';

import { getGenericHeaders } from '@utils/api/get-headers-helper';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('unhappy path POST Request tests | @api @post', () => {
  test('Should return 500 when mandatory fields are missing from booking creation | @JIRA-179', async ({
    request,
  }) => {
    const incompleteBookingData: BaseBooking = new BookingBuilder().build();
    // Omitt mandatory fields like firstname and lastname
    delete incompleteBookingData.firstname;
    delete incompleteBookingData.lastname;

    const response: APIResponse = await request.post(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`,
      {
        data: incompleteBookingData,
        headers: await getGenericHeaders(request),
      }
    );

    expect(response.status()).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  // Negative scenario for validating POST request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should receive a 400 when POST request is missing content-type from request headers | @JIRA-182', async ({
    request,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass against the demo API.'
    );
    const newBookingData = new BookingBuilder().build();

    const headersWithoutContentType = { ...(await getGenericHeaders(request)) };
    // @ts-ignore
    delete headersWithoutContentType['Content-Type'];

    const response: APIResponse = await request.post(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`,
      {
        data: newBookingData,
        headers: headersWithoutContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST);

    // Consider that a failure response from the API does not guarantee the action has failed
    // Querying the relevant endpoint for data that should have been rejected will provide validation of the failure response
  });

  // Negative scenario for validating POST request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should receive a 415 when POST request has invalid content-type in request headers | @JIRA-183', async ({
    request,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass against the demo API.'
    );
    const newBookingData = new BookingBuilder().build();

    const headersWithUnsupportedContentType = {
      ...(await getGenericHeaders(request)),
      'Content-Type': 'text/plain',
    };

    const response: APIResponse = await request.post(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`,
      {
        data: newBookingData,
        headers: headersWithUnsupportedContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);

    // Consider that a failure response from the API does not guarantee the action has failed
    // Querying the relevant endpoint for data that should have been rejected will provide validation of the failure response
  });
});
