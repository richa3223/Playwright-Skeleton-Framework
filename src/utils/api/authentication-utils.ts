import CONFIG from '@config/configManager';
import type { APIRequestContext } from '@playwright/test';

// Authenticates against the Restful Booker API and retrieves an authentication token
export async function getAuthenticationToken(request: APIRequestContext): Promise<string> {
  // Sending a POST request to the authentication endpoint of the API
  const authResponse = await request.post(
    `${CONFIG.api.restfulBooker.baseUrl}${CONFIG.api.restfulBooker.endpoints.auth}`,
    {
      // In the RestfulBooker example, the admin account is the only user who can get the token - otherwise user credentials should be a function argument
      data: CONFIG.api.restfulBooker.testUsers.admin,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!authResponse.ok()) {
    throw new Error('Authentication response not expected.');
  }

  const { token } = await authResponse.json();
  return token;
}
