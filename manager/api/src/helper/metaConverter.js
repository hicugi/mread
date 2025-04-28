/**
 * @param {Object} obj
 * @return {string}
*/
export const encode = (obj) => {
  const res = [];

  for (const key in obj) {
    res.push([key, obj[key]].join(": "))
  }

  return res.join("\n")
}

/**
 * @param {string} body 
 * @return {Object} obj
*/
export const decode = (body) => {
  const res = {};
  const items = body.split("\n");

  for (const line of items) {
    const idx = line.indexOf(":");

    if (idx === -1) continue;

    res[line.substring(0, idx)] = line.substring(idx + 2);
  }

  return res;
}

export default { encode, decode };

