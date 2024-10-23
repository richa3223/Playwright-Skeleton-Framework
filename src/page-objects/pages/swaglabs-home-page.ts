import type { User } from '@data/models/users';
import CONFIG from '@config/configManager';
import { BasePage } from '../base-page';

export class SwagLabsHomePage extends BasePage {
  readonly usernameInput = this.page.locator('#user-name');
  readonly passwordInput = this.page.locator('#password');
  readonly loginButton = this.page.locator('#login-button');
  readonly errorMessageHeading = this.page.locator('[data-test="error"]');

  override path = '/';

  override async goTo() {
    let retryAttempt = 0;
    const maxRetries = CONFIG.test.navigationRetries;
    let pageNavigation;
    while (retryAttempt < maxRetries) {
      try {
        pageNavigation = await this.page.goto(CONFIG.ui.swagLabs.baseUrl + this.path);
        break;
      } catch (error) {
        retryAttempt++;
        this.logger.warn(
          `Navigation attempt ${retryAttempt + 1}: TimeoutError error occurred. Retrying...`
        );
        if (retryAttempt === maxRetries) {
          throw new Error('Page navigation failed');
        }
      }
    }
    return pageNavigation;
  }

  async logIn(user: User) {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.loginButton.click();
  }
}
