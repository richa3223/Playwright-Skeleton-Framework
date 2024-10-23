import { expect, test } from 'src/fixtures/ui-fixtures';

test.describe('Locale example tests | @ui @locale @wikipedia @desktop', () => {
  /* Playwright allows users to overwrite base test configuration set in `playwright.config.ts` with the usage of `test.use`. However, 
  at this time it is not possible to overwrite test.use per test. Instead, overwrites must be made within the test.describe block */
  test.describe('ES (Spanish) Locale | @es', () => {
    test.use({
      locale: 'es-ES',
    });
    test('Spanish locales will display the Spanish version of the website | @JIRA-0001', async ({
      wikipediaHomePage,
    }) => {
      await wikipediaHomePage.goTo();
      await wikipediaHomePage.searchInput.fill('blink-182');
      await wikipediaHomePage.searchButton.click();

      await Promise.all([
        /* This locator is both language and test specific, so we do not need to declare it on the Page Object as it would only be used once.
        If we were expecting to host a great deal of locale tests or across multiple locales, we would expect developers to add test-id attributes. */
        expect(
          wikipediaHomePage.page.getByRole('link', { name: 'Discografía', exact: true })
        ).toBeVisible(),
        expect(wikipediaHomePage.page).toHaveURL(/.*es.wikipedia.*/),
      ]);
    });
  });

  test.describe('DE (German) Locale | @de', () => {
    test.use({
      locale: 'de-DE',
    });
    test('German locales will display the German version of the website | @JIRA-0001', async ({
      wikipediaHomePage,
    }) => {
      await wikipediaHomePage.goTo();
      await wikipediaHomePage.searchInput.fill('blink-182');
      await wikipediaHomePage.searchButton.click();

      await Promise.all([
        expect(wikipediaHomePage.page.getByRole('link', { name: 'Die Anfänge' })).toBeVisible(),
        expect(wikipediaHomePage.page).toHaveURL(/.*de.wikipedia.*/),
      ]);
    });
  });
});
