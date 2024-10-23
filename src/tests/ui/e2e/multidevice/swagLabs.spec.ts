import CONFIG from '@config/configManager';
import { UserBuilder } from '@data/builders/users-builder';
import { faker } from '@faker-js/faker';
import { expect, test } from 'src/fixtures/ui-fixtures';

test.describe('Swaglabs end-to-end | @ui @e2e @swaglabs @multidevice', () => {
  // To avoid repetition across the spec, we can use constants
  const SAUCE_LABS_BACKPACK = 'Sauce Labs Backpack';
  const SAUCE_LABS_BIKE_LIGHT = 'Sauce Labs Bike Light';

  test.beforeEach(async ({ swagLabsHomePage }) => {
    await swagLabsHomePage.goTo();
  });

  test('Swaglabs buy journey | @JIRA-0001 @buyJourney', async ({
    swagLabsHomePage,
    swagLabsInventoryPage,
    swagLabsNavBarComponent,
    swagLabsCartPage,
    swagLabsCheckoutPage,
    swagLabsOrderConfirmationPage,
  }) => {
    await test.step('User logs in', async () => {
      const standardUser = new UserBuilder()
        .setUser(CONFIG.ui.swagLabs.testUsers.standardUser)
        .build();
      await swagLabsHomePage.logIn(standardUser);
    });

    let productTotalPrice = 0;
    await test.step('User adds items to basket', async () => {
      await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BACKPACK);
      const backpackPrice = await swagLabsInventoryPage.getItemPriceByName(SAUCE_LABS_BACKPACK);

      await swagLabsInventoryPage.addItemToCartByName(SAUCE_LABS_BIKE_LIGHT);
      const tShirtPrice = await swagLabsInventoryPage.getItemPriceByName(SAUCE_LABS_BIKE_LIGHT);
      productTotalPrice = backpackPrice + tShirtPrice;
    });

    await test.step('User navigates to checkout', async () => {
      await swagLabsNavBarComponent.cartLink.click();
      await swagLabsCartPage.checkoutButton.click();
    });

    await test.step('User completes checkout', async () => {
      await swagLabsCheckoutPage.firstNameInput.fill(faker.person.firstName());
      await swagLabsCheckoutPage.lastNameInput.fill(faker.person.lastName());
      await swagLabsCheckoutPage.postalCodeInput.fill(faker.location.zipCode());

      await swagLabsCheckoutPage.continueButton.click();
    });

    await test.step('Expected checkout prices correspond to actual', async () => {
      await swagLabsCheckoutPage.itemPrices.first().waitFor();

      expect(await swagLabsCheckoutPage.getSumOfItemPrices()).toEqual(productTotalPrice);
      expect(await swagLabsCheckoutPage.getItemSubtotalPrice()).toEqual(productTotalPrice);
      expect(await swagLabsCheckoutPage.getTotalPrice()).toEqual(
        productTotalPrice + (await swagLabsCheckoutPage.getTaxPrice())
      );
    });

    await test.step('User proceeds to order confirmation', async () => {
      await swagLabsCheckoutPage.finishButton.click();
      await expect(swagLabsOrderConfirmationPage.orderConfirmedHeader).toBeVisible();
    });
  });
});
