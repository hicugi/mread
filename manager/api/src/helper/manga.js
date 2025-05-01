import { domain } from "../config.js";

export const getMangaImage = (req, dir) => {
  const { host } = req.headers;
  return `http://${host}/manga/${dir}/image`;
}

export const getChapterLabel = (link) => {
  link = link.trim();

  const { chapters } = domain.get(link);

  if (chapters.labelMatch !== undefined) {
    const val = link.match(chapters.labelMatch);
    return val[1];
  }

  if (chapters.formatLabel !== undefined) {
    return chapters.formatLabel(link);
  }

  let label = link;
  label = label.replace(/\/+$/, '').split("/").at(-1);
  label = label.replace(/^([a-z]|_|-)+/ig, "");
  label = label.replace(/([a-z]|_)+/ig, "-");
  label = label.replace(/-{2,}/g, "-");

  return label;
}

export const getChapterNumber = (str) => {
  let res = "";
  if (Number(str) >= 0) {
    return Number(str);
  }

  let isFloat = false;
  let floatStr = "";
  let floatCount = 0;
  const FLOAT_MULT = 3;

  const addFloat = () => {
    if (floatStr === "") return;

    const count = Math.max(0, FLOAT_MULT * floatCount - floatStr.length);
    res += Number(`0.${"0".repeat(count)}${floatStr}`);

    floatStr = "";
    floatCount += 1;
  }

  for (const ch of str) {
    if (!isFloat) {
      if (Number(ch) >= 0) {
        res += ch;
        continue;
      }

      res = Number(res);
      isFloat = true;
      continue;
    }

    if (Number(ch) >= 0) {
      floatStr += ch;
      continue;
    }

    addFloat();
  }

  if (floatStr) addFloat();

  return res;
}

