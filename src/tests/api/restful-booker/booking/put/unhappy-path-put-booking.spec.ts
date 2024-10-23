import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BookingBuilder } from '@data/builders/booking-builder';
import type { BaseBooking } from '@data/models/bookings';
import { BaseBookingSchema } from '@data/models/bookings';

import { getGenericHeaders } from '@utils/api/get-headers-helper';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('PUT Request tests', () => {
  test('Should return 403 when PUTing a booking update without authorisation | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    const updatedBookingData: BaseBooking = new BookingBuilder().build();
    const headersWithoutAuthToken = { 'Content-Type': 'application/json' };

    // Attempt to update without an authorization token
    const response: APIResponse = await request.put(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: updatedBookingData,
        headers: headersWithoutAuthToken,
      }
    );

    // Verify 403 Forbidden status returned
    expect(response.status()).toBe(StatusCodes.FORBIDDEN);
  });

  // Negative scenario for validating PUT request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should return 400 when PUT request is missing content-type from request headers | @JIRA-184', async ({
    request,
    generatedBookingId,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass agains the demo API.'
    );
    const updatedBookingData = new BookingBuilder().build();

    const headersWithoutContentType = { ...(await getGenericHeaders(request)) };
    // @ts-ignore
    delete headersWithoutContentType['Content-Type'];

    const response: APIResponse = await request.put(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: updatedBookingData,
        headers: headersWithoutContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST);

    // Verify the attempted PUT was unsuccessful
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    const validationResponseBody = BaseBookingSchema.parse(await validationResponse.json());
    expect(validationResponseBody.firstname).not.toBe(updatedBookingData.firstname);
  });

  // Negative scenario for validating PUT request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should return 415 when PUT request has invalid content-type in request headers | @JIRA-185', async ({
    request,
    generatedBookingId,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass agains the demo API.'
    );
    const updatedBookingData = new BookingBuilder().build();

    const headersWithUnsupportedContentType = {
      ...(await getGenericHeaders(request)),
      'Content-Type': 'text/plain',
    };

    const response: APIResponse = await request.put(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: updatedBookingData,
        headers: headersWithUnsupportedContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);

    // Verify the attempted PUT was unsuccessful
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    const validationResponseBody = BaseBookingSchema.parse(await validationResponse.json());
    expect(validationResponseBody.firstname).not.toBe(updatedBookingData.firstname);
  });
});
