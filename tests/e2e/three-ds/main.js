import { load } from "../../../src";
import { urlParamsToObject } from "../utils/url-params-to-object"


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
