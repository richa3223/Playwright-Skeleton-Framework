import { BasePage } from '../base-page';

export class SwagLabsOrderConfirmationPage extends BasePage {
  readonly orderConfirmedHeader = this.page.locator('[data-test="complete-header"]');
}
