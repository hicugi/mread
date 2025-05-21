import fsMain from "fs";

/**
 * @param {string} url
 * @param {string} filePath 
*/
export async function downloadFromUlr(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      const size = r.headers["content-length"];

      if (r.statusCode !== 200) {
        r.resume();
        return reject(error);
      }

      r.pipe(fsMain.createWriteStream(filePath))
        .on('error', reject)
        .once("close", () => resolve(true));
    });
  });
}
