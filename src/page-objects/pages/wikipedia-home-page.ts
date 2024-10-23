import CONFIG from '@config/configManager';
import { BasePage } from '../base-page';

export class WikipediaHomePage extends BasePage {
  readonly searchInput = this.page.getByLabel('Search Wikipedia');
  readonly searchButton = this.page.getByRole('button', { name: 'Search' });

  // This is required as the baseUrl of the wikipedia page differs from the baseUrl defined in the basePage.
  override async goTo() {
    let retryAttempt = 0;
    const maxRetries = CONFIG.test.navigationRetries;
    let pageNavigation;
    while (retryAttempt < maxRetries) {
      try {
        pageNavigation = await this.page.goto(CONFIG.ui.wikipedia.baseUrl + this.path);
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
}
