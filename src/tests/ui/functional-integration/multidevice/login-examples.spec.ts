import CONFIG from '@config/configManager';
import { UserBuilder } from '@data/builders/users-builder';
import type { User } from '@data/models/users';
import { expect, test } from 'src/fixtures/ui-fixtures';

/* UI driven login tests should prove:
1. Valid logins are supported via the UI, and expected redirects (e.g. to the post-login page) occur.
2. Error messages are surfaced to the users
UI tests should not exist to test the authentication behaviour itself, rather that the authentication behaviour is propagated 
as expected to the user as described above. Testing the functional login application behaviour should be covered in API tests. */

const SESSION_COOKIE_NAME = 'session-username';

test.describe('Login behaviour tests | @ui @example @login @multidevice', () => {
  test.beforeEach(async ({ swagLabsHomePage }) => {
    await swagLabsHomePage.goTo();
  });

  test('Users with valid credentials can log in | @JIRA-0001 @swaglabs', async ({
    swagLabsHomePage,
    swagLabsInventoryPage,
  }) => {
    // Create the user to log in
    const standardUser: User = new UserBuilder()
      .setUser(CONFIG.ui.swagLabs.testUsers.standardUser)
      .build();
    await swagLabsHomePage.logIn(standardUser);
    // validate URL is as expected
    await expect.soft(swagLabsInventoryPage.page).toHaveURL(/inventory/);
    // validate cookie is correct
    expect
      .soft((await swagLabsHomePage.getCookie(SESSION_COOKIE_NAME)).value)
      .toBe(CONFIG.ui.swagLabs.testUsers.standardUser.username);
    // validate user 'sees' expected content following login
    expect.soft((await swagLabsInventoryPage.images.all()).length).toBeGreaterThan(1);
  });

  test('Locked out user gets an error notification on login attempt | @JIRA-0001 @swaglabs', async ({
    swagLabsHomePage,
  }) => {
    // Example of using builder to create user data
    const lockedOutUser: User = new UserBuilder().setLockedOutUser().build();
    await swagLabsHomePage.logIn(lockedOutUser);
    await expect(swagLabsHomePage.errorMessageHeading).toBeVisible();
    await expect(swagLabsHomePage.errorMessageHeading).toContainText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
  });

  // Additional error scenario: users notified of issue if API service isn't available. Negative scenarios such as these require a mocking tool such as Wiremock.
});
