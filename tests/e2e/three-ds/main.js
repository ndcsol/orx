import { load } from "../../../src";

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

function createResultElement(id, content) {
  const element = document.createElement("pre");
  element.id = id;
  element.innerText = content;
  return element;
}

document.addEventListener("DOMContentLoaded", async () => {
  const { threeDsPayload, loadPayload } = urlParamsToObject();
  const { instance } = await load(loadPayload)
  instance.threeDs(threeDsPayload).then(results => {
    const parsedResponse = JSON.stringify(results, null, 2);
    if (results.status === 'success') {
      const successElement = createResultElement('success', parsedResponse);
      document.getElementsByTagName("body")[0].appendChild(successElement);
    } else {
      const errorElement = createResultElement('error', parsedResponse);
      document.getElementsByTagName("body")[0].appendChild(errorElement);
    }
  }).catch((error) => {
    const parsedResponse = JSON.stringify(error, null, 2);
    const errorElement = createResultElement('error', parsedResponse);
    document.getElementsByTagName("body")[0].appendChild(errorElement);
  })
});
