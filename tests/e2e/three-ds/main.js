import { threeDs } from "../../../src";

function urlParamsToObject() {
  let queryParams = {};
  let queryString = window.location.search.substring(1);
  let pairs = queryString.split("&");

  pairs.forEach(pair => {
    let [key, value] = pair.split("=");
    key = decodeURIComponent(key); // Decode the key
    let keys = key.split("[");
    let currentObj = queryParams;

    keys.forEach((key, index) => {
      key = key.replace("]", "");
      if (index === keys.length - 1) {
        currentObj[key] = decodeURIComponent(value);
      } else {
        currentObj[key] = currentObj[key] || {};
        currentObj = currentObj[key];
      }
    });
  });

  return queryParams;
}

document.addEventListener("DOMContentLoaded", async () => {
  const threeDsPayload = urlParamsToObject();
  threeDs(threeDsPayload).then(results => {
    document.getElementById("success").innerText = JSON.stringify(results, null, 2);
  }).catch((error) => {
    document.getElementById("error").innerText = JSON.stringify(error, null, 2);
  })
});
