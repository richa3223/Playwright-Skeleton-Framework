import type { APIRequestContext } from '@playwright/test';
import { getAuthenticationToken } from './authentication-utils';

// Pre-populates to include generic header detail & authentication token for ease of setup in tests
// If you need to change the header details that can be done within the individual test by pulling this setup in and tweaking (Ex in: /booking/delete/unhappy-path-delete-booking.spec.ts)
export async function getGenericHeaders(request: APIRequestContext) {
  const token: string = await getAuthenticationToken(request);
  return {
    'Content-Type': 'application/json',
    Cookie: `token=${token}`,
  };
}
