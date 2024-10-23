import { BasePage } from '../base-page';

export class SwagLabsCartPage extends BasePage {
  readonly cartPrices = this.page.locator('[data-test="inventory-item-price"]');
  readonly checkoutButton = this.page.locator('[data-test="checkout"]');

  override path = '/cart.html';
}
