import { test, expect } from "@playwright/test";

test("ORX SDK should render expected output", async ({ page }) => {
  await page.goto("http://localhost:5173/three-ds/");
  await page.waitForSelector("body");
  expect(await page.locator("text=3Ds").isVisible()).toBeTruthy();
});
