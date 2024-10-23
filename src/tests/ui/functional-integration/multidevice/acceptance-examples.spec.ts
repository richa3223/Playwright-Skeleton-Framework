import { linkOpensInNewTab } from '@utils/ui/locator-utils';
import { addSessionStorageContext } from '@utils/ui/session-storage-utils';
import { expect, test } from 'src/fixtures/ui-fixtures';

// Test describe/feature is tagged with high-level test tags
test.describe('Example acceptance tests | @ui @multidevice', () => {
  // To avoid repetition across the spec, we can use constants
  const SAUCE_LABS_BACKPACK = 'Sauce Labs Backpack';
  const SAUCE_LABS_BIKE_LIGHT = 'Sauce Labs Bike Light';

  /* These tests utilise the session state created by the setup script in `src/tests/auth.setup.ts`, removing the need for each test to log in again.
  Please note that there must be considerations of server-side state with such a strategy - For example, if tests share a user and one changes the password, subsequent tests will break.
  There are various authentication approaches supported by Playwright. For more information on this, please see: https://playwright.dev/docs/auth */
  test.use({ storageState: '.auth/browser-context/standard_user.json' });

  // Swaglab's authentication also requires session storage to be set. This may not be required for other UI implementation.
  test.beforeEach(async ({ swagLabsInventoryPage }) => {
    await addSessionStorageContext(
      swagLabsInventoryPage.page,
      '.auth/session-storage/standard_user.json'
    );
    await swagLabsInventoryPage.goTo();
  });

  // Positive scenario: adding items to the cart updates the UI - this is important for user feedback
  test('Adding items to the cart on the inventory page updates the cart badge | @JIRA-0001 @cart', async ({
    swagLabsInventoryPage,
    swagLabsNavBarComponent,
  }) => {
    await swagLabsInventoryPage.goTo();
    await expect(swagLabsNavBarComponent.cartBadge).toBeHidden();
    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BACKPACK);
    await expect(swagLabsNavBarComponent.cartBadge).toBeVisible();
    await expect(swagLabsNavBarComponent.cartBadge).toHaveText('1');

    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BIKE_LIGHT);
    await expect(swagLabsNavBarComponent.cartBadge).toBeVisible();
    await expect(swagLabsNavBarComponent.cartBadge).toHaveText('2');
  });

  // Positive scenario: adding items to the cart is persisted across page navigations - this is important for user experience
  test('Items added to the cart on the inventory page are visible on the checkout page | @JIRA-0001 @cart', async ({
    swagLabsInventoryPage,
    swagLabsNavBarComponent,
    swagLabsCheckoutPage,
  }) => {
    await swagLabsInventoryPage.goTo();
    await expect(swagLabsNavBarComponent.cartBadge).toBeHidden();
    const backpackPrice = await swagLabsInventoryPage.getItemPriceByName(SAUCE_LABS_BACKPACK);
    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BACKPACK);

    const bikeLightPrice = await swagLabsInventoryPage.getItemPriceByName(SAUCE_LABS_BIKE_LIGHT);
    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BIKE_LIGHT);

    await swagLabsNavBarComponent.cartLink.click();
    expect(await swagLabsCheckoutPage.getSumOfItemPrices()).toEqual(backpackPrice + bikeLightPrice);

    // Multiple actions can be executed simultaneously as long as they do not modify page state (e.g. clicking on a link or inputting text)
    await Promise.all([
      expect(swagLabsCheckoutPage.cartItemNames).toContainText([
        SAUCE_LABS_BACKPACK,
        SAUCE_LABS_BIKE_LIGHT,
      ]),
      expect(swagLabsCheckoutPage.cartItemNames).toHaveCount(2),
    ]);
  });

  // Negative scenario: remove items from cart updates the UI - this is important for user feedback
  test('Items can be removed from the cart on the checkout page | @JIRA-0001 @cart', async ({
    swagLabsInventoryPage,
    swagLabsNavBarComponent,
    swagLabsCheckoutPage,
  }) => {
    await swagLabsInventoryPage.goTo();
    await expect(swagLabsNavBarComponent.cartBadge).toBeHidden();
    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BACKPACK);

    const bikeLightPrice = await swagLabsInventoryPage.getItemPriceByName(SAUCE_LABS_BIKE_LIGHT);
    await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BIKE_LIGHT);

    await swagLabsNavBarComponent.cartLink.click();

    await swagLabsCheckoutPage.removeItemByName(SAUCE_LABS_BACKPACK);
    expect(await swagLabsCheckoutPage.getSumOfItemPrices()).toEqual(bikeLightPrice);

    await Promise.all([
      expect(swagLabsCheckoutPage.cartItemNames).toContainText(SAUCE_LABS_BIKE_LIGHT),
      expect(swagLabsCheckoutPage.cartItemNames).toHaveCount(1),
      expect(swagLabsNavBarComponent.cartBadge).toBeVisible(),
      expect(swagLabsNavBarComponent.cartBadge).toHaveText('1'),
    ]);
  });

  /* Positive scenario: Example test of integrating with third party service.
  Validation of third-party pages & external services should not be the responsibility of early-environment integration tests
  as the service access can be fickle and subject to change. 
  We also do not want to maintain page objects for external dependencies, so we can validate:
  - implementation of the contract in the UI on our (URL & tab behaviour)
  - validation of browser request to downstream service (where applicable)
  And add an E2E test to prove the expected response in the appropriate environment (usually SIT) */
  test('Clicking on the linkedin link in the footer redirects the user to linkedin | @JIRA-0002', async ({
    swagLabsFooterComponent,
  }) => {
    const SAUCE_LABS_LINKEDIN_PATH = '/company/sauce-labs/';

    await expect
      .soft(swagLabsFooterComponent.sauceLabsLinkedInLink)
      .toHaveAttribute('href', new RegExp(`.*${SAUCE_LABS_LINKEDIN_PATH}`));

    expect.soft(await linkOpensInNewTab(swagLabsFooterComponent.sauceLabsLinkedInLink)).toBe(true);

    //Capture browser request
    const requestPromise = swagLabsFooterComponent.getNetworkRequestByUrl(SAUCE_LABS_LINKEDIN_PATH);
    await swagLabsFooterComponent.sauceLabsLinkedInLink.click();
    const navigationRequest = await requestPromise;

    //Validate UI has implemented the contract with the downstream system correctly
    expect(navigationRequest).not.toBeUndefined();
    expect(navigationRequest!.url()).toContain(SAUCE_LABS_LINKEDIN_PATH);
    expect(await navigationRequest!.allHeaders()).toHaveProperty('accept-language', 'en-US');
  });
});
