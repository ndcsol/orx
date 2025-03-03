import { test, expect } from "@playwright/test";
import { createThreeDsRespnse, deleteThreeDsResponse } from './stripe'

function urlEncodeNestedObject(obj: any, prefix = "") {
  let str: string[] = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      let k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push(
        v !== null && typeof v === "object"
          ? urlEncodeNestedObject(v, k)
          : encodeURIComponent(k) + "=" + encodeURIComponent(v)
      );
    }
  }
  return str.join("&");
}

test.describe.configure({
  mode: 'parallel'
});

test.describe('Proper handling of the stripe modal', () => {
  let threeDsPayload;
  test.beforeEach(async () => {
    threeDsPayload = await createThreeDsRespnse();
  });
  test.afterEach(async () => {
    await deleteThreeDsResponse(threeDsPayload);
  })

  test("Stripe modal is triggered and confirmed successfully", async ({ page }) => {
    const payload = urlEncodeNestedObject(threeDsPayload);
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
    expect(threeDsResult.payload.setupIntent.id).toBe(threeDsPayload.setupIntent.id);

    expect(threeDsResult.status).toBe("success");
    expect(threeDsResult.payload.setupIntent.status).toBe("succeeded");
  });

  test("Stripe modal is triggered and fails successfully", async ({ page }) => {
    const payload = urlEncodeNestedObject(threeDsPayload);
    await page.goto("http://localhost:5173/three-ds/?" + payload);
    await page.waitForSelector("body");

    const stripeIframe = await page.waitForSelector("iframe[name^=__privateStripeFrame]");
    expect(stripeIframe).not.toBeNull();

    const iframe = await stripeIframe!.contentFrame();
    const iframeWithinIframe = await iframe?.waitForSelector("iframe");
    const stripeIframeWithinIframe = await iframeWithinIframe?.contentFrame();
    await page.waitForTimeout(2000);
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

