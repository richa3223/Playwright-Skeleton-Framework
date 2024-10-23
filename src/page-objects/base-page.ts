//Importing necessary modules and types
import CONFIG from '@config/configManager';
import type { Cookie, Page as PlaywrightPage, Request } from 'playwright-core';
import { getLogger } from 'src/logger-config';
import type { IPage } from './page-interface';

//Abstract class BasePage implementing IPage interface
export abstract class BasePage implements IPage {
  //Constructor with PlaywrightPage as parameter
  constructor(public readonly page: PlaywrightPage) {}

  logger = getLogger();
  //Path variable, to be overwritten by implementations of the base-page
  path = '';

  /* This is used to navigate to the url extended by BasePage.
  For example, swagLabsInventoryPage.goTo() would always navigate to the swagLab's base URL + the path variable stated in the page object.
  Each page needs to override the path variable to reflect the page's url on the given website */
  async goTo() {
    //Variables for retry logic
    let retryAttempt = 0;
    const maxRetries = CONFIG.test.navigationRetries;
    //Check if maxRetries is a valid number
    if (isNaN(maxRetries)) {
      throw new Error('Invalid navigation retries value');
    }
    let pageNavigation;
    //Retry logic for page navigation
    while (retryAttempt < maxRetries) {
      try {
        pageNavigation = await this.page.goto(CONFIG.ui.swagLabs.baseUrl + this.path);
        break;
      } catch (error) {
        retryAttempt++;
        this.logger.warn(
          `Navigation attempt ${retryAttempt + 1}: TimeoutError error occurred. Retrying...`
        );
        //Throw error if max retries reached
        if (retryAttempt === maxRetries) {
          throw new Error('Page navigation failed');
        }
      }
    }
    return pageNavigation;
  }

  async getCookie(cookieName: string): Promise<Cookie> {
    const cookie = (await this.page.context().cookies()).find(
      (cookie) => cookie.name === cookieName
    );
    if (!cookie) {
      throw new Error(`Cookie ${cookie} is undefined.`);
    }
    return cookie;
  }

  async isCookiePresent(cookieName: string): Promise<boolean> {
    const cookie = await this.page.context().cookies();
    return cookie.some((c) => c.name === cookieName);
  }

  /* Network events can be observed with Playwright, see: https://playwright.dev/docs/network#network-events 
  If interacting with a webpage creates a network request but opens this in a new tab, use the below function. 
  If the network request is made in the same browser tab, consider using `page.waitForRequest()` instead. */
  async getNetworkRequestByUrl(partialUrl: string): Promise<Request | undefined> {
    return new Promise<Request | undefined>((resolve) => {
      // This function is deliberately returning an unawaited promise as the request is not expected to occur until a subsequent UI action.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.page.context().route('**', async (route) => {
        if (route.request().url().includes(partialUrl)) {
          // Save the request, but continue routing to avoid blocking the matching route.
          const request = route.request();
          resolve(request);
        } else {
          // Continue routing unmatched requests, as we do not want to block any route.
          await route.continue();
        }
      });
    });
  }
}
