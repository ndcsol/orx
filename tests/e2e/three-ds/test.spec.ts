import { test, expect } from "@playwright/test";
import { createThreeDsRespnse, deleteThreeDsResponse } from '../utils/stripe'
import { urlEncodeNestedObject } from '../utils/url-encode-nested-object'

test.describe.configure({
  mode: 'parallel'
});

test.describe('Proper handling of the stripe modal', () => {
  let allPayloads;
  test.beforeEach(async () => {
    allPayloads = await createThreeDsRespnse();
  });
  test.afterEach(async () => {
    await deleteThreeDsResponse(allPayloads.threeDsPayload);
  })

  test("Stripe modal is triggered and confirmed successfully", async ({ page }) => {
    const payload = urlEncodeNestedObject(allPayloads);
    await page.goto("http://localhost:5173/three-ds/?" + payload);
    await page.waitForSelector("body");

    const stripeIframe = await page.waitForSelector("iframe[name^=__privateStripeFrame]");
    expect(stripeIframe).not.toBeNull();

    const iframe = await stripeIframe!.contentFrame();
    const iframeWithinIframe = await iframe?.waitForSelector("iframe");
    const stripeIframeWithinIframe = await iframeWithinIframe?.contentFrame();
    await page.waitForTimeout(1000);
    const completeButton = await stripeIframeWithinIframe?.waitForSelector("#test-source-authorize-3ds", {
      state: 'visible'
    });
    await completeButton?.click();

    const errorOrSuccessElement = await Promise.race([page.waitForSelector("#success", {
      state: 'attached'
    }), page.waitForSelector("#error", {
      state: 'attached'
    })]);

    expect(await errorOrSuccessElement.getAttribute("id")).toBe("success");

    const threeDsResult = JSON.parse((await errorOrSuccessElement.textContent())!);
    expect(threeDsResult.payload.setupIntent.id).toBe(allPayloads.threeDsPayload.setupIntent.id);

    expect(threeDsResult.status).toBe("success");
    expect(threeDsResult.payload.setupIntent.status).toBe("succeeded");
  });

  test("Stripe modal is triggered and fails successfully", async ({ page }) => {
    const payload = urlEncodeNestedObject(allPayloads);
    await page.goto("http://localhost:5173/three-ds/?" + payload);
    await page.waitForSelector("body");

    const stripeIframe = await page.waitForSelector("iframe[name^=__privateStripeFrame]");
    expect(stripeIframe).not.toBeNull();

    const iframe = await stripeIframe!.contentFrame();
    const iframeWithinIframe = await iframe?.waitForSelector("iframe");
    const stripeIframeWithinIframe = await iframeWithinIframe?.contentFrame();
    await page.waitForTimeout(1000);
    const failButton = await stripeIframeWithinIframe?.waitForSelector("#test-source-fail-3ds", {
      state: 'visible'
    });
    await failButton?.click();

    const errorOrSuccessElement = await Promise.race([page.waitForSelector("#success", {
      state: 'attached'
    }), page.waitForSelector("#error", {
      state: 'attached'
    })]);
    expect(await errorOrSuccessElement.getAttribute("id")).toBe("error");
    const threeDsResult = JSON.parse((await errorOrSuccessElement.textContent())!);
    expect(threeDsResult.gateway).toBe('stripe');
    expect(threeDsResult.status).toBe("error");
  });
});

