import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { getGenericHeaders } from '@utils/api/get-headers-helper';

import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('happy path DELETE Requests | @api @delete', () => {
  test('Should return 204 when DELETEing a booking | @JIRA-179', async ({
    request,
    generatedBookingId,
  }) => {
    const response: APIResponse = await request.delete(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        headers: await getGenericHeaders(request),
      }
    );

    // The website will return a 200/201, rather than 204 so this test scenario will result in a failure
    // This is intentional to demonstrate an example of the error validation in play and the expected API behaviour
    expect(response.status()).toBe(StatusCodes.NO_CONTENT);
    // Attempting to fetch the deleted booking to confirm it has been successfully removed
    const verifyDelete = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(verifyDelete.status()).toBe(StatusCodes.NOT_FOUND);

    /*
      If you have direct access to the database, it's good practice to verify the deletion
      directly from the database instead of relying on the API response. Direct database verification
      ensures the booking has been truly removed and not just made inaccessible through the API.
      
      Example (pseudocode):
      const bookingExists = database.query("SELECT EXISTS(SELECT 1 FROM bookings WHERE id = ?)", defaultBookingId);
      expect(bookingExists).toBeFalsy();
    */
  });
});
