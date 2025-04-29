export const getMangaImage = (req, dir) => {
  const { host } = req.headers;
  return `http://${host}/manga/${dir}/image`;
}

