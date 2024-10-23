import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BaseBookingSchema, GetBookingIdsResponseSchema } from '@data/models/bookings';

import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('happy path GET Request tests | @api @get', () => {
  test('GET booking response conforms to the booking schema | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    const response: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(response.status()).toBe(StatusCodes.OK);
    // Validates the structure of the response body against the BaseBooking schema
    await expect((await response.json()) as unknown).toMatchSchema(BaseBookingSchema);
  });

  test('GET all bookings and verify response | @JIRA-179', async ({ request }) => {
    const response: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}`
    );
    expect(response.status()).toBe(StatusCodes.OK);

    await expect((await response.json()) as unknown).toMatchSchema(GetBookingIdsResponseSchema);
    const bookingIds = GetBookingIdsResponseSchema.parse(await response.json());

    // Ensures at least one booking is returned, indicating data presence.
    expect(bookingIds.length).toBeGreaterThan(0);
    expect(bookingIds[0].bookingid).toBeDefined();
  });
});
