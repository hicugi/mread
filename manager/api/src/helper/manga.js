export const getMangaImage = (req, dir) => {
  const { host } = req.headers;
  return `http://${host}/manga/${dir}/image`;
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

