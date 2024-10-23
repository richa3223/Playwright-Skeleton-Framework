import AxeBuilder from '@axe-core/playwright';
import CONFIG from '@config/configManager';
import { SwagLabsFooterComponent } from '@pageObjects/components/footer-component';
import { SwagLabsNavBarComponent } from '@pageObjects/components/swaglabs-nav-component';
import { SwagLabsCartPage } from '@pageObjects/pages/swaglabs-cart-page';
import { SwagLabsCheckoutPage } from '@pageObjects/pages/swaglabs-checkout-page';
import { SwagLabsHomePage } from '@pageObjects/pages/swaglabs-home-page';
import { SwagLabsInventoryPage } from '@pageObjects/pages/swaglabs-inventory-page';
import { SwagLabsOrderConfirmationPage } from '@pageObjects/pages/swaglabs-order-confirmation-page';
import { WikipediaHomePage } from '@pageObjects/pages/wikipedia-home-page';
import { getLogger } from 'src/logger-config';
import { test as baseFixtures } from './base-fixtures';

const logger = getLogger();

type pages = {
  //Swag Labs - Pages
  swagLabsHomePage: SwagLabsHomePage;
  swagLabsInventoryPage: SwagLabsInventoryPage;
  swagLabsCheckoutPage: SwagLabsCheckoutPage;
  swagLabsCartPage: SwagLabsCartPage;
  swagLabsOrderConfirmationPage: SwagLabsOrderConfirmationPage;

  //Swag Labs - Components
  swagLabsNavBarComponent: SwagLabsNavBarComponent;
  swagLabsFooterComponent: SwagLabsFooterComponent;

  //Wikipedia
  wikipediaHomePage: WikipediaHomePage;
};

// Extension of playwright's 'test' fixture
/* The pages fixture allows for page objects to be instantiated and injected into the test.
This avoids boilerplate `const homePage = new SwagLabsHomePage(page)` in tests. See any of the UI 
tests for examples of this. */
export const test = baseFixtures
  .extend<pages>({
    //Swag Labs - Pages (organised for readability)
    swagLabsHomePage: async ({ page }, use) => {
      await use(new SwagLabsHomePage(page));
    },
    swagLabsInventoryPage: async ({ page }, use) => {
      await use(new SwagLabsInventoryPage(page));
    },
    swagLabsCheckoutPage: async ({ page }, use) => {
      await use(new SwagLabsCheckoutPage(page));
    },
    swagLabsCartPage: async ({ page }, use) => {
      await use(new SwagLabsCartPage(page));
    },
    swagLabsOrderConfirmationPage: async ({ page }, use) => {
      await use(new SwagLabsOrderConfirmationPage(page));
    },
    //Swag Labs - Components (organised for readability)
    swagLabsNavBarComponent: async ({ page }, use) => {
      await use(new SwagLabsNavBarComponent(page));
    },
    swagLabsFooterComponent: async ({ page }, use) => {
      await use(new SwagLabsFooterComponent(page));
    },

    //Wikipedia - Pages (organised for readability)
    wikipediaHomePage: async ({ page }, use) => {
      await use(new WikipediaHomePage(page));
    },
  })

  /* Accessibility (Axe) fixture.
  This provides a preconfigured axe object for each test wanting to use it.
  If `CONFIG.test.accessibility.autoscanEnabled` is set to 'true', each UI will automatically scan for accessibility violations just before closing the browser. */
  .extend<{ axeBuilder: AxeBuilder }>({
    axeBuilder: [
      async ({ page }, use, testInfo) => {
        //Initialize an AxeBuilder with the specified accessibility standards
        const axeBuilder = new AxeBuilder({ page }).withTags(CONFIG.test.accessibility.axeTags);

        await use(axeBuilder);
        //Everything underneath the 'use' is executed after the test has finished - see: https://playwright.dev/docs/test-fixtures#execution-order

        //Dedicated accessibility tests do not need a re-scan - this can't be triggered sooner in the fixture as the tests will hang
        if (testInfo.project.testMatch.toString().includes('accessibility')) return;

        //Skip the accessibility scan following each UI test if `CONFIG.test.accessibility.autoscanEnabled` is set to 'true'.
        if (CONFIG.test.accessibility.autoscanEnabled === false) return;

        //Execute the scan
        const accessibilityResults = await axeBuilder.analyze();

        //Expect no accessibility violations
        expect.soft(accessibilityResults.violations, 'Auto-accessibility test failed.').toEqual([]);

        if (accessibilityResults.violations.length > 0) {
          logger.warn(
            `${accessibilityResults.violations.length} accessibility violations found for "${testInfo.title.split('|')[0].trim()}" | testId: ${testInfo.testId}`
          );
          test.info().annotations.push({
            type: 'Accessibility Violations',
            description: `${accessibilityResults.violations.length} violations found.`,
          });
        }
      },
      //Auto is set to true, so the fixture will be automatically used in all tests, scope is set to 'test' to create a new AxeScanner per test
      { scope: 'test', auto: true },
    ],
  });

/* To keep things consistent and simple, despite not modifying the original expect functionality, 
we export it to allow both 'test' and 'expect' to be imported from the same file in tests, and to avoid confusion */
export const expect = test.expect;
