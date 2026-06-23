const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'mediroute-mock.html');

test.describe('MediRoute — Hub', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Hub loads correctly', async ({ page }) => {
    await expect(page.locator('.logo')).toHaveText('MediRoute');
    await expect(page.locator('.hub-bento-card')).toHaveCount(4);
    await expect(page.locator('.hub-mini-card')).toHaveCount(4);
  });

  test('No JS errors on hub load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err));
    await page.reload();
    await page.waitForSelector('.hub-bento-card');
    expect(errors).toEqual([]);
  });

  test('Phone frame renders', async ({ page }) => {
    await expect(page.locator('.phone-frame')).toBeVisible();
    await expect(page.locator('.phone-screen')).toBeVisible();
    await expect(page.locator('.phone-notch')).toBeVisible();
  });

  test('Hub search bar exists', async ({ page }) => {
    await expect(page.locator('.hub-search-app input')).toBeVisible();
  });

  // Quick Access mini-grid
  test('Quick Access — My Info', async ({ page }) => {
    await page.locator('.hub-mini-card').first().click();
    await expect(page.locator('.screen-header')).toContainText('Medical Profile', { timeout: 3000 });
  });

  test('Quick Access — Insurance', async ({ page }) => {
    await page.locator('.hub-mini-card').nth(1).click();
    await expect(page.locator('#costCards')).toBeVisible({ timeout: 3000 });
  });

  test('Quick Access — Guide', async ({ page }) => {
    await page.locator('.hub-mini-card').nth(2).click();
    await expect(page.locator('.screen-header')).toContainText('Healthcare Guide', { timeout: 3000 });
  });

  test('Quick Access — Q&A', async ({ page }) => {
    await page.locator('.hub-mini-card').nth(3).click();
    await expect(page.locator('.screen-header')).toContainText('Medical Q&A', { timeout: 3000 });
  });
});

test.describe('MediRoute — Emergency Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Chest Pain — loads chat triage', async ({ page }) => {
    await page.keyboard.press('1'); // Emergency category
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Bleeding — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-emergency').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(1).click(); // Bleeding
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Head Injury — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-emergency').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(2).click();
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Child Emergency — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-emergency').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(3).click();
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('MediRoute — Clinic Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Fever/Flu — via keyboard', async ({ page }) => {
    await page.keyboard.press('2'); // Clinic category
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Mild Symptoms — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-clinic').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(1).click();
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Injury — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-clinic').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(2).click();
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Dental — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-clinic').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(3).click();
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('MediRoute — Medication Routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Get a Prescription — via keyboard', async ({ page }) => {
    await page.keyboard.press('3'); // Medication category
    await expect(page.locator('.screen-header')).toContainText('Past Visits', { timeout: 3000 });
    await expect(page.locator('.m3-list-item')).toHaveCount(4);
  });

  test('Drug Interaction — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-medication').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(1).click();
    await expect(page.locator('.screen-header')).toContainText('Drug Interactions', { timeout: 3000 });
  });

  test('Lost Medication — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-medication').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(2).click();
    await expect(page.locator('.clinic-list')).toBeVisible({ timeout: 3000 });
  });

  test('Pre-Travel Check — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-medication').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(3).click();
    await expect(page.locator('.ins-form')).toBeVisible({ timeout: 3000 });
  });

  test('Get Prescription — click first clinic', async ({ page }) => {
    await page.keyboard.press('3');
    await expect(page.locator('.m3-list-item')).toHaveCount(4);
    await page.locator('.m3-list-item').first().click();
    await expect(page.locator('.screen-header')).toContainText('Tokyo Midtown', { timeout: 3000 });
  });
});

test.describe('MediRoute — Translation & Cost', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Pharmacy Translation — via keyboard', async ({ page }) => {
    await page.keyboard.press('4'); // Translation category
    await expect(page.locator('.screen-header')).toContainText('Live Translation', { timeout: 3000 });
  });

  test('Doctor Visit Translation — via expand menu', async ({ page }) => {
    await page.locator('#bento-expand-translation').click();
    await page.waitForTimeout(200);
    const subitems = page.locator('.hub-bento-subs.open .hub-bento-subitem');
    await subitems.nth(1).click();
    await expect(page.locator('.screen-header')).toContainText('Live Translation', { timeout: 3000 });
  });

  test('Cost & Insurance — via keyboard', async ({ page }) => {
    await page.keyboard.press('5'); // Cost category
    await expect(page.locator('#costCards')).toBeVisible({ timeout: 3000 });
    await page.locator('#btnAddInsurance').click();
    await expect(page.locator('#insProvider')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('MediRoute — Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FILE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.phone-screen');
  });

  test('Keyboard H returns to hub', async ({ page }) => {
    await page.locator('.hub-mini-card').first().click();
    await page.keyboard.press('h');
    await expect(page.locator('.hub-bento-card')).toHaveCount(4, { timeout: 3000 });
  });

  test('Keyboard R restarts route', async ({ page }) => {
    await page.keyboard.press('1');
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
    await page.keyboard.press('r');
    // Should still be on chat screen (restarted)
    await expect(page.locator('.chat-header')).toBeVisible({ timeout: 3000 });
  });

  test('Bottom nav Back button disabled on hub', async ({ page }) => {
    await expect(page.locator('#backBtn')).toBeDisabled();
  });

  test('Bottom nav navigates cost flow forward', async ({ page }) => {
    await page.keyboard.press('5');
    await expect(page.locator('#costCards')).toBeVisible({ timeout: 3000 });
    await page.locator('#nextBtn').click();
    await expect(page.locator('#insProvider')).toBeVisible({ timeout: 3000 });
  });

  test('Back button from step 0 goes to hub', async ({ page }) => {
    // Coverage is step 0 of cost-info route
    await page.keyboard.press('5');
    await expect(page.locator('#costCards')).toBeVisible({ timeout: 3000 });
    // Screen-level back on step 0 should go to hub
    const backBtn = page.locator('.btn-primary').filter({ hasText: 'Back' });
    if (await backBtn.count() > 0) {
      await backBtn.first().click();
      await expect(page.locator('.hub-bento-card')).toHaveCount(4, { timeout: 3000 });
    }
  });
});
