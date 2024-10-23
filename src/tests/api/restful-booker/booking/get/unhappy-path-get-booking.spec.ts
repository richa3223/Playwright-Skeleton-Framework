import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';

import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('unhappy path GET Request tests | @api @get', () => {
  test('Should return 404 when GETing a non-existent booking | @JIRA-179', async ({ request }) => {
    // Ids are numeric, so will not be found
    const invalidBookingId = 'xxx';
    const response: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${invalidBookingId}`
    );

    // There's no response body, so only the status will be asserted against; please check API Approach and Good Automation wikis for best practice
    expect(response.status()).toBe(StatusCodes.NOT_FOUND);
  });
});
