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

});

