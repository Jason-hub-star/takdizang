import { test, expect } from "@playwright/test";

test.describe("Visual regression - key pages", () => {
  test("home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("home.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("settings page", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("settings.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("landing page", async ({ page }) => {
    await page.goto("/landing");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("projects page", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("projects.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
