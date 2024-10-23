import AxeBuilder from '@axe-core/playwright';
import CONFIG from '@config/configManager';
import { addSessionStorageContext } from '@utils/ui/session-storage-utils';
import { expect, test } from 'src/fixtures/ui-fixtures';

test.describe('Accessibility tests | @accessibility', () => {
  test('Swag Labs Home Page accessibility test | @JIRA-0001', async ({
    swagLabsHomePage,
    axeBuilder,
  }) => {
    await swagLabsHomePage.goTo();
    /*you may want to add page interactions here 
    expanding accordions, clicking buttons, etc., see: 
    https://playwright.dev/docs/accessibility-testing#configuring-axe-to-scan-a-specific-part-of-a-page */

    //Wait for page to load to avoid running the accessibility scan too soon
    await swagLabsHomePage.page.waitForLoadState();

    // The axeBuilder is preconfigured in the `src/fixtures/ui-fixtures.ts` file with the appropriate tags
    const accessibilityScanResults = await axeBuilder.analyze();

    //The only assertion required in accessibility tests is to check if there are no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility tests with authenticated user states | @accessibility', () => {
  // Some pages may only be accessibile with a logged in user
  test.use({ storageState: '.auth/browser-context/standard_user.json' });

  test.beforeEach(async ({ swagLabsInventoryPage }) => {
    await addSessionStorageContext(
      swagLabsInventoryPage.page,
      '.auth/session-storage/standard_user.json'
    );
    await swagLabsInventoryPage.goTo();
  });

  test('Swag Labs Inventory Page accessibility test | @JIRA-0001', async ({
    page,
    swagLabsInventoryPage,
  }) => {
    await swagLabsInventoryPage.goTo();
    await swagLabsInventoryPage.page.waitForLoadState();

    // If you wish to provide custom tags to the accessibility scan, you can create a new AxeBuilder without use of the ui-fixture.
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(CONFIG.test.accessibility.axeTags)
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
