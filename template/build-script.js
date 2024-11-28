import fs from "fs/promises";

const script = await fs.readFile("dist/script.js");
const style = await fs.readFile("dist/style.css");

let html = await fs.readFile("dist/index.html");
html = html.toString();

html = html.replace(
  '<script type="module" crossorigin src="/script.js"></script>',
  ""
);
const index = html.indexOf("</body>");
html =
  html.substring(0, index) +
  "<script>" +
  script.toString() +
  "</script>" +
  html.substring(index);

html = html.replace(
  '<link rel="stylesheet" crossorigin href="/style.css">',
  `<style>${style.toString()}</style>`
);

fs.writeFile("dist/template.html", html);
