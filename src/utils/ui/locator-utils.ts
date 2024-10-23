//Helper file for common operations on Locators not provided by Playwright SDK
import type { Locator } from 'playwright-core';

export async function linkOpensInNewTab(locator: Locator): Promise<boolean> {
  //Check if locator is a link - if not, throw error as this is not a valid use case
  const isLink = (await locator.getAttribute('href')) ?? false;
  if (!isLink) {
    throw new Error('Supplied locator is not a link');
  }
  const target = await locator.getAttribute('target');
  if (!target) {
    return false;
  }
  //If the target attribute is present and set to _blank, browsers will open it in a new tab
  return target === '_blank';
}

// Extracts a number from a locators innertext
export async function getFloatFromLocatorText(
  locator: Locator,
  contentToRemove?: string | RegExp
): Promise<number> {
  let text = await locator.innerText();
  if (contentToRemove) {
    text = text.replace(contentToRemove, '');
  }
  return parseFloat(text);
}
