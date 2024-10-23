import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BaseBookingSchema } from '@data/models/bookings';
import { getGenericHeaders } from '@utils/api/get-headers-helper';

import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('happy path PATCH Requests | @api @patch', () => {
  test('Partially update a booking and verify response | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    // Initial Get Request to save the current state of the booking
    const initialResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(initialResponse.status()).toBe(StatusCodes.OK);
    await expect((await initialResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const initialResponseBody = BaseBookingSchema.parse(await initialResponse.json());

    const partialUpdateData = { firstname: 'Jane Updated' };

    const updateResponse: APIResponse = await request.patch(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: partialUpdateData,
        headers: await getGenericHeaders(request),
      }
    );
    expect(updateResponse.status()).toBe(StatusCodes.OK);
    // Uses the schema to validate the complete response structure
    await expect((await updateResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const responseBody = BaseBookingSchema.parse(await updateResponse.json());

    // Validation Get Request to verify the update was applied
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    // Validates the structure of the response body against the BaseBooking schema
    await expect((await validationResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const validationResponseBody = BaseBookingSchema.parse(await validationResponse.json());
    expect.soft(validationResponseBody.firstname).toBe(responseBody.firstname);

    // Verify that other fields remain unchanged
    expect.soft(validationResponseBody.lastname).toBe(initialResponseBody.lastname);
    expect.soft(validationResponseBody.totalprice).toBe(initialResponseBody.totalprice);
    expect.soft(validationResponseBody.depositpaid).toBe(initialResponseBody.depositpaid);
    expect.soft(validationResponseBody.bookingdates).toEqual(initialResponseBody.bookingdates);
    expect.soft(validationResponseBody.additionalneeds).toBe(initialResponseBody.additionalneeds);
  });
});
