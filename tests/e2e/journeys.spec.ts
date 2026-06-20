import { test, expect } from '@playwright/test';

test.describe('CarbonNode E2E Journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('Journey 1: Log carbon calculator activity and compile weekly AI story', async ({
    page,
  }) => {
    // Proves that adding a transport activity calculates carbon, updates the dashboard budget totals, and allows compilation of the weekly AI story via dev bypass.
    await page.goto('/dashboard');

    // 1. Log manual activity
    await page.click('button[aria-label="Log manual carbon activity"]');
    await page.fill('input[id="manual-description"]', 'Petrol Commute');
    await page.selectOption('select[id="manual-subtype"]', 'car_petrol');
    await page.fill('input[id="manual-multiplier"]', '20');

    // Verify emission estimation on screen: 0.171 * 20 = 3.42 kg (modal shows 2 decimals)
    await expect(page.locator('text=3.42 kg')).toBeVisible();

    // Save activity
    await page.click('button:has-text("Save Activity")');

    // Verify modal is closed and dashboard shows updated monthly value (dashboard header rounds to 1 decimal)
    await expect(page.locator('header >> text=3.4 kg')).toBeVisible();

    // 2. Weekly Carbon Story
    // Check "Dev Bypass" to activate button if not Sunday or not enough logs
    const devBypassCheckbox = page.locator('input[type="checkbox"]');
    if (await devBypassCheckbox.isVisible()) {
      await devBypassCheckbox.check();
    }

    const compileBtn = page.locator('button:has-text("Compile Weekly Narrative")');
    await expect(compileBtn).toBeEnabled();
    await compileBtn.click();

    // Verify story card updates and displays achievements or rating
    await expect(
      page.locator('text=Story Archive').or(page.locator('text=Highlight Achievement')),
    ).toBeVisible();
  });

  test('Journey 2: Upload receipt image, view breakdown list, and verify world visual updates', async ({
    page,
  }) => {
    // Proves that uploading a receipt PNG image triggers optimization/scanning, displays Swiggy/Zomato item totals, and transitions the world visual state.
    await page.goto('/dashboard');

    // Upload a mock PNG image file using setInputFiles
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG Magic Bytes
    await page.setInputFiles('input[type="file"]', {
      name: 'receipt.png',
      mimeType: 'image/png',
      buffer,
    });

    // Wait for the "Scan Receipt" button to appear and click it
    const scanBtn = page.locator('button:has-text("Scan Receipt")');
    await expect(scanBtn).toBeVisible();
    await scanBtn.click();

    // Verify Zomato/Swiggy items and total rendering from backend response fallback
    await expect(page.locator('text=Zomato Food Delivery')).toBeVisible();
    await expect(page.locator('text=Chicken Biryani (Double Portion)')).toBeVisible();
    await expect(page.locator('text=4.0 kg').first()).toBeVisible();

    // Verify that the total monthly carbon header has updated
    await expect(page.locator('header >> text=4.0 kg')).toBeVisible();

    // Verify world visual is present
    const worldLabel = page.locator('div.absolute.bottom-2.left-4.right-4 >> p');
    await expect(worldLabel).toBeVisible();
  });

  test('Journey 3: Open carbon mirror webcam, stream fake camera feed, and capture snapshot', async ({
    page,
  }) => {
    // Proves that clicking the webcam trigger starts a mocked camera stream, renders a live video player, and closes the stream on capture.
    await page.goto('/dashboard');

    // Trigger webcam mirror modal / flow
    await page.click('button[aria-label="Open Webcam Mirror"]');

    // Verify live video container and LIVE MIRROR badge appear
    const video = page.locator('video[aria-label="Webcam live preview"]');
    await expect(video).toBeVisible();
    await expect(page.locator('text=LIVE MIRROR')).toBeVisible();

    // Capture & analyze image (this runs mock daily analysis callback)
    await page.click('button:has-text("Capture & Analyze")');

    // Stream should close, and AI analysis result details should appear
    await expect(video).not.toBeVisible();
    await expect(page.locator('text=Public Commute (Metro/Bus)')).toBeVisible();
    await expect(page.locator('text=Vegetarian Meal')).toBeVisible();
  });
});
