import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BookingBuilder } from '@data/builders/booking-builder';
import type { BaseBooking } from '@data/models/bookings';
import { BaseBookingSchema, CreateBookingResponseSchema } from '@data/models/bookings';

import { getGenericHeaders } from '@utils/api/get-headers-helper';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('happy path POST Request tests | @api @post', () => {
  test('Should return 201 when creating a new booking | @JIRA-179', async ({ request }) => {
    const bookingData: BaseBooking = new BookingBuilder().build();

    const response: APIResponse = await request.post(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`,
      {
        data: bookingData,
        headers: await getGenericHeaders(request),
      }
    );

    // The website will return a 200, rather than 201 so this test scenario will result in a failure
    // This is intentional to demonstrate an example of the error validation in play and the expected API behaviour
    expect(response.status()).toBe(StatusCodes.CREATED);
    // Uses the schema to validate the complete response structure
    await expect((await response.json()) as unknown).toMatchSchema(CreateBookingResponseSchema);
    const responseBody = CreateBookingResponseSchema.parse(await response.json());
    // Validates that the request response reflects the requested details.
    expect.soft(responseBody.booking).toEqual(bookingData);
    expect.soft(responseBody.bookingid).toBeDefined();

    // Verifies persistence and correctness of the newly created booking.
    const bookingId = responseBody.bookingid;
    const fetchResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${bookingId}`
    );
    expect(response.status()).toBe(StatusCodes.OK);
    // Validates the structure of the response body against the BaseBooking schema
    await expect((await response.json()) as unknown).toMatchSchema(BaseBookingSchema);
    const fetchedBooking = BaseBookingSchema.parse(await fetchResponse.json());
    // Validates that the created booking reflects the requested details.
    expect(fetchedBooking).toEqual(bookingData);
  });
});
