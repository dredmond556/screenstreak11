import { test } from '@playwright/test';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.beforeAll(async () => {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
});

test.describe('Screenshots', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14-ish

  test('Home', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/01-home.png', fullPage: true });
  });

  test('Stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/stats`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/02-stats.png', fullPage: true });
  });

  test('Alternatives', async ({ page }) => {
    await page.goto(`${BASE_URL}/alternatives`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/03-alternatives.png', fullPage: true });
  });

  test('Settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/04-settings.png', fullPage: true });
  });
});

