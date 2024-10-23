import type { Page } from 'playwright-core';
import * as fs from 'fs';

export async function saveSessionStorageContext(page: Page, path: string) {
  const session = await page.evaluate(() => JSON.stringify(sessionStorage));
  fs.writeFileSync(path, session, 'utf-8');
}
export async function addSessionStorageContext(page: Page, fileName: string) {
  const sessionStorage = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  await page.context().addInitScript((storage) => {
    for (const [key, value] of Object.entries(storage))
      window.sessionStorage.setItem(key, value as string);
  }, sessionStorage);
}
