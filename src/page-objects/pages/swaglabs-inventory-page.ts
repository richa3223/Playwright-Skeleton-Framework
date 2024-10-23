import type { Locator } from '@playwright/test';
import { getFloatFromLocatorText } from '@utils/ui/locator-utils';
import { BasePage } from '../base-page';

export class SwagLabsInventoryPage extends BasePage {
  readonly images = this.page.locator('.inventory_item_img');
  readonly inventoryItems = this.page.locator('[data-test="inventory-item"]');
  readonly inventoryItemTitles = this.page.locator('[data-test$="title-link"]');
  readonly inventoryItemPrices = this.page.locator('[data-test="inventory-item-price"]');
  readonly inventoryItemAddToCartButtons = this.page.locator('[data-test^="add-to-cart"]');
  override path = '/inventory.html';

  async getItemPriceByName(itemName: string): Promise<number> {
    const inventoryPanel: Locator = this.getInventoryItem(itemName);
    // the locator is specific to the selected inventory panel, so cannot be declared at the top of the SwagLabsInventoryPage class.
    const inventoryItemPrice: Locator = inventoryPanel.locator(this.inventoryItemPrices);
    return getFloatFromLocatorText(inventoryItemPrice, '$');
  }

  async addItemToCartByName(itemName: string): Promise<void> {
    const inventoryPanel: Locator = this.getInventoryItem(itemName);
    await inventoryPanel.locator(this.inventoryItemAddToCartButtons).click();
  }

  getInventoryItem(itemName: string): Locator {
    const inventoryPanel: Locator = this.inventoryItems.filter({
      has: this.inventoryItemTitles.filter({ hasText: itemName }),
    });
    return inventoryPanel;
  }
}
