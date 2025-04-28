/**
 * @param {string} regx
 * @param {function} handler
**/
export const getChapters = (response, regx, handler) => {
  const url = response.url();
  if (new RegExp(regx).test(url) === false) return;

  handler(response);
}

export const downloadChapters = (req, res) => {
}
