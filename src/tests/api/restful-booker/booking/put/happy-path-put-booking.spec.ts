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
  test('All of the booking data can be updated with a PUT request | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    // Prepare the updated booking data
    const updatedBookingData: BaseBooking = new BookingBuilder().build();

    const updateResponse: APIResponse = await request.put(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: updatedBookingData,
        headers: await getGenericHeaders(request),
      }
    );

    expect(updateResponse.status()).toBe(StatusCodes.OK);
    // Validates the structure of the response body against the BaseBooking schema
    await expect((await updateResponse.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const updateResponseBody = BaseBookingSchema.parse(await updateResponse.json());
    // Validates that the request response reflects the update details.
    expect.soft(updateResponseBody).toEqual(updatedBookingData);

    // Validation Get Request to verify the update was applied
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    // Validates the structure of the response body against the BaseBooking schema
    expect((await validationResponse.json()) as unknown).toEqual(updatedBookingData);
  });
});
