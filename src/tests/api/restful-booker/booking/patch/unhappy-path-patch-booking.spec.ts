import type { APIResponse } from '@playwright/test';
import { test } from 'src/fixtures/api-fixtures';

import CONFIG from '@config/configManager';
import { BaseBookingSchema } from '@data/models/bookings';

import { StatusCodes } from 'http-status-codes';
import { expect } from 'src/fixtures/base-fixtures';

test.describe('unhappy path PATCH Requests | @api @patch', () => {
  // Negative scenario for validating PATCH request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should receive a 400 when PATCH request is missing content-type from request headers | @JIRA-180', async ({
    request,
    generatedBookingId,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass agains the demo API.'
    );
    const partialUpdateData = { firstname: 'Test Missing Content-Type' };
    const headersWithoutContentType = {};

    const response: APIResponse = await request.patch(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: partialUpdateData,
        headers: headersWithoutContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST);

    // Verify the attempted PATCH wasn't successful
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    const validationResponseBody = BaseBookingSchema.parse(await validationResponse.json());
    expect(validationResponseBody.firstname).not.toBe(partialUpdateData.firstname);
  });

  // Negative scenario for validating PATCH request headers. This functionality isn't implemented by the example API so the test is skipped.
  test('Should receive a 415 when PATCH request has invalid content-type in request headers | @JIRA-181', async ({
    request,
    generatedBookingId,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(
      true,
      'this test is only for process documentation purposes and is not expected to pass agains the demo API.'
    );
    const partialUpdateData = { firstname: 'Unsupported Content-Type' };
    const headersWithUnsupportedContentType = { 'Content-Type': 'text/plain' };

    const response: APIResponse = await request.patch(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`,
      {
        data: partialUpdateData,
        headers: headersWithUnsupportedContentType,
      }
    );

    expect(response.status()).toBe(StatusCodes.UNSUPPORTED_MEDIA_TYPE);

    // Verify that the attempted PATCH wasn't successful
    const validationResponse: APIResponse = await request.get(
      `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.booking}/${generatedBookingId}`
    );
    expect(validationResponse.status()).toBe(StatusCodes.OK);
    const validationResponseBody = BaseBookingSchema.parse(await validationResponse.json());
    expect(validationResponseBody.firstname).not.toBe(partialUpdateData.firstname);
  });
});
