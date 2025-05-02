import { test, expect } from "@playwright/test";
import { urlEncodeNestedObject } from '../utils/url-encode-nested-object'
import { createLoadResponse } from '../utils/stripe'

test.describe.configure({
  mode: 'parallel'
});

test.describe('Proper creation of Stripe Radar Session', () => {
  let allPayloads;
  test.beforeEach(async () => {
    allPayloads = await createLoadResponse();
  });
  test.afterEach(async () => {
  })

  test("Stripe sessions are created successfully", async ({ page }) => {
    const payload = urlEncodeNestedObject(allPayloads);
    await page.goto("http://localhost:5173/create-session/?" + payload);
    await page.waitForSelector("body");

    await page.waitForTimeout(1000);

    const errorOrSuccessElement = await Promise.race([page.waitForSelector("#success", {
      state: 'attached'
    }), page.waitForSelector("#error", {
      state: 'attached'
    })]);

    expect(await errorOrSuccessElement.getAttribute("id")).toBe("success");
    const threeDsResult = JSON.parse((await errorOrSuccessElement.textContent())!);
    expect(threeDsResult.payload.radarSession.id).toBeTruthy();
    expect(threeDsResult.status).toBe("success");
  });
});

