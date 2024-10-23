import { BasePage } from '../base-page';

export class SwagLabsFooterComponent extends BasePage {
  readonly sauceLabsLinkedInLink = this.page.locator('[data-test="social-linkedin"]');
}
