import { test as setup } from '@playwright/test';

import CONFIG from '@config/configManager';
import { UserBuilder } from '@data/builders/users-builder';
import type { User } from '@models/users';
import { SwagLabsHomePage } from '@pageObjects/pages/swaglabs-home-page';
import { saveSessionStorageContext } from '@utils/ui/session-storage-utils';
import { getLogger } from 'src/logger-config';

const userSessionStorageFilePath = '.auth/session-storage/standard_user.json';
const userBrowserContextFilePath = '.auth/browser-context/standard_user.json';
const logger = getLogger();

/* While this is a hook, Playwright treats it as a test (see it's usage in playwright.config.ts), and expects it to be in the test dir (/src/tests). For this reason we cannot have this file in `/src/hooks/`.

Consider the various alterate approaches to authentication as documented by playwright, this project utilises the following: https://playwright.dev/docs/auth#multiple-signed-in-roles
All approaches have their use cases and drawbacks depending on the data available and scenarios under test. Do not skip the reading of the above link!

Authenticating via the UI and saving the authenticated state will only provide an authenticated state for the UI tests. 
API authentication is invisible to the browser and tests as the UI service will authenticate via an API service and these interactions are not surfaced. Therefore API authentication must occur via a separate mechanism. */
setup('save session storage & cookie data for authentication', async ({ page }) => {
  logger.info(
    `Authenticating as '${CONFIG.ui.swagLabs.testUsers.standardUser.username}' via session storage...`
  );

  const swagLabsHomePage = new SwagLabsHomePage(page);
  await swagLabsHomePage.goTo();
  const standardUser: User = new UserBuilder()
    .setUsername(CONFIG.ui.swagLabs.testUsers.standardUser.username)
    .setPassword(CONFIG.ui.swagLabs.testUsers.standardUser.password)
    .build();
  await swagLabsHomePage.logIn(standardUser);

  // Save the browser context - usually this will be sufficient
  await swagLabsHomePage.page.context().storageState({ path: userBrowserContextFilePath });
  await saveSessionStorageContext(swagLabsHomePage.page, userSessionStorageFilePath);

  logger.info(
    `Authentication as '${CONFIG.ui.swagLabs.testUsers.standardUser.username}' saved to path ${userSessionStorageFilePath}`
  );
});
