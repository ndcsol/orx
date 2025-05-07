import { load } from "../../../src";
import { urlParamsToObject } from "../utils/url-params-to-object"


function createResultElement(id, content) {
  const element = document.createElement("pre");
  element.id = id;
  element.innerText = content;
  return element;
}

document.addEventListener("DOMContentLoaded", async () => {
  const { loadPayload, sessionPayload } = urlParamsToObject();
  const { instance } = await load(loadPayload)
  instance.createContext(sessionPayload).then(results => {
    const parsedResponse = JSON.stringify(results, null, 2);
    if (results.status === 'success') {
      const successElement = createResultElement('success', parsedResponse);
      document.getElementsByTagName("body")[0].appendChild(successElement);
    }
  }).catch((error) => {
    const parsedResponse = JSON.stringify(error, null, 2);
    const errorElement = createResultElement('error', parsedResponse);
    document.getElementsByTagName("body")[0].appendChild(errorElement);
  })
});
