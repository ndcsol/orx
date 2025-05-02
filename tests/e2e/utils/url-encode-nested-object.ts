export function urlEncodeNestedObject(obj: any, prefix = "") {
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
