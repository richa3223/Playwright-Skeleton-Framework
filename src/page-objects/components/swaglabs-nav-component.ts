import { BasePage } from '../base-page';

export class SwagLabsNavBarComponent extends BasePage {
  readonly cartLink = this.page.locator('[data-test="shopping-cart-link"]');
  readonly cartBadge = this.page.locator('[data-test="shopping-cart-badge"]');
}
