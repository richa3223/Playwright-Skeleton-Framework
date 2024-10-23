import { getFloatFromLocatorText } from '@utils/ui/locator-utils';
import { BasePage } from '../base-page';

export class SwagLabsCheckoutPage extends BasePage {
  readonly firstNameInput = this.page.locator('[data-test="firstName"]');
  readonly lastNameInput = this.page.locator('[data-test="lastName"]');
  readonly postalCodeInput = this.page.locator('[data-test="postalCode"]');
  readonly continueButton = this.page.locator('[data-test="continue"]');
  readonly itemPrices = this.page.locator('[data-test="inventory-item-price"]');
  readonly itemSubTotalLabel = this.page.locator('[data-test="subtotal-label"]');
  readonly itemTaxLabel = this.page.locator('[data-test="tax-label"]');
  readonly itemTotalLabel = this.page.locator('[data-test="total-label"]');
  readonly finishButton = this.page.locator('[data-test="finish"]');
  readonly cartItemNames = this.page.locator('[data-test="inventory-item-name"]');
  readonly removeButtons = this.page.locator('[data-test^="remove"]');

  async getSumOfItemPrices(): Promise<number> {
    const itemPrices = await this.itemPrices.allInnerTexts();
    let runningTotal = 0;
    itemPrices.forEach((price) => {
      runningTotal += parseFloat(price.replace('$', ''));
    });
    return runningTotal;
  }

  async getItemSubtotalPrice(): Promise<number> {
    return await getFloatFromLocatorText(this.itemSubTotalLabel, 'Item total: $');
  }

  async getTotalPrice(): Promise<number> {
    return await getFloatFromLocatorText(this.itemTotalLabel, 'Total: $');
  }

  async getTaxPrice(): Promise<number> {
    return await getFloatFromLocatorText(this.itemTaxLabel, 'Tax: $');
  }

  async removeItemByName(itemName: string): Promise<void> {
    // This locator is specific to the cart item's name, so cannot be declared at the top of the SwagLabsCheckoutPage class.
    const item = this.page.locator('[class="cart_item_label"]', { hasText: itemName });
    await item.locator(this.removeButtons).click();
  }
}
