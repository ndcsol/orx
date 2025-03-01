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

test.describe('Proper handling of the stripe modal', () => {

  let threeDsPayload;

  test.beforeAll(async () => {
    threeDsPayload = await createThreeDsRespnse();
  });

  test.afterAll(async () => {
    await deleteThreeDsResponse(threeDsPayload);
  })

  test("ORX SDK should render expected output", async ({ page }) => {
    const payload = urlEncodeNestedObject(threeDsPayload);
    await page.goto("http://localhost:5173/three-ds/?" + payload);
    await page.waitForSelector("body");
    //Find the iframe whose name starts with __privateStripeFrame
    const stripeIframe = await page.waitForSelector("iframe[name^=__privateStripeFrame]");
    expect(stripeIframe).not.toBeNull();

    const iframe = await stripeIframe!.contentFrame();
    const iframeWithinIframe = await iframe?.waitForSelector("iframe");
    const stripeIframeWithinIframe = await iframeWithinIframe?.contentFrame();
    const completeButton = await stripeIframeWithinIframe?.waitForSelector("#test-source-authorize-3ds", {
      state: 'visible'
    });
    await completeButton?.click();
    //read the contents of the #success and #error elements
    const successElement = await page.waitForSelector("#success", {
      state: 'attached'
    });
    const errorElement = await page.waitForSelector("#error", {
      state: 'attached'
    });
    await page.waitForTimeout(20000);
    expect(successElement.textContent()).resolves.toBeTruthy();
    expect(errorElement.textContent()).resolves.toBeFalsy();

    const threeDsResult = JSON.parse((await successElement.textContent())!);
    expect(threeDsResult.payload.setupIntent.id).toBe(threeDsPayload.setupIntent.id);

    expect(threeDsResult.status).toBe("success");
    expect(threeDsResult.payload.setupIntent.status).toBe("succeeded");
  });

});

