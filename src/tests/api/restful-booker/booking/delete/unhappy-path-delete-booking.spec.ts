import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BaseBookingSchema } from '@data/models/bookings';

import { getGenericHeaders } from '@utils/api/get-headers-helper';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('DELETE Requests', () => {
  test('Should return 403 when DELETEing a booking update without authorisation | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    const headersWithoutAuthToken = { 'Content-Type': 'application/json' };

    const response: APIResponse = await request.delete(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        headers: headersWithoutAuthToken,
      }
    );

    // Check for 403 Forbidden
    expect.soft(response.status()).toBe(StatusCodes.FORBIDDEN);

    // Verify the attempted DELETE wasn't successful
    const bookingResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(bookingResponse.status()).toBe(StatusCodes.OK);
    await expect((await bookingResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const bookingResponseBody = BaseBookingSchema.parse(await bookingResponse.json());
    expect(bookingResponseBody.firstname).toBeDefined();
  });

  // Negative Scenario for handling a 500 Internal Server Error. This functionality is not implemented by the example API so the test is skipped.
  test('Trigger a 500 Internal Server Error response | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass agains the demo API.'
    );

    // This example assumes there's a specific request that you know will trigger a 500 error.
    const response = await request.delete(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: { invalidData: 'This should trigger a server error' },
        headers: await getGenericHeaders(request),
      }
    );

    // Verify that the server responds with a 500 Internal Server Error status.
    expect(response.status()).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

    // Further validation can be done to check the response body for error details, meaningful error messages or codes.

    // Verify the attempted DELETE wasn't successful
    const bookingResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(bookingResponse.status()).toBe(StatusCodes.OK);
    await expect((await bookingResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const bookingResponseBody = BaseBookingSchema.parse(await bookingResponse.json());
    expect(bookingResponseBody.firstname).toBeDefined();
  });
});
