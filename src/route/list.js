import fs from "fs/promises";
import { MANGA_DIR } from "../config.js";

export const getList = async (_, res) => {
  const list = await fs.readdir(MANGA_DIR);

  const result = list
    .filter((elm) => elm[0] !== ".")
    .map((name) => ({
      name,
      image: `http://localhost:8000/manga/${name}/cover.jpg`,
    }));

  res.send(result);
};
