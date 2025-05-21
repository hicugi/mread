import path from "path";
import fs from "fs/promises";
import fsMain from "fs";

export const removeDir = async (dir) => {
  const openedDir = await fs.readdir(dir, { withFileTypes: true, recursive: true });
  const items = [];

  for await (const item of openedDir) {
    const p = path.resolve(item.path, item.name);
    items.push({
      depth: p.split("/").length,
      path: p,
    });
  }

  items.sort((a, b) => b.depth - a.depth);
  console.log(items);

  for (const item of items) {
    await fs.unlink(item.path);
  }
  await fs.unlink(dir);
}

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
