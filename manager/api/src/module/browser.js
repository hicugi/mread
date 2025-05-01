import path from "path";
import fs from "fs";
import { firefox } from "playwright";  // Or 'chromium' or 'firefox'.

const wait = (timeout) => new Promise((ok) => setTimeout(ok, timeout));

export const openPage = async (url, evaluateProps, options = {}) => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  options.page = page;

  await page.setViewportSize({
    width: 1240,
    height: 8000,
  });

  if (options.onResponse !== undefined) {
    page.on("response", options.onResponse);
  }

  await page.goto(url);
  let result = await page.evaluate(...evaluateProps);

  if (options.nextPageClick !== undefined) {
    result = new Set(result);

    while (true) {
      const nextPageInfo = await page.evaluate(options.nextPageCheck).catch(() => null);
      if (nextPageInfo === null) continue;

      const { current, total } = nextPageInfo;
      if (options.update !== undefined) {
        options.update("checking next page", { current, total });
      }

      if (current === total) break;

      await page.keyboard.press("ArrowRight");
      const items = await page.evaluate(...evaluateProps);

      for (const item of items) {
        result.add(item);
      }

      await wait(1000);
    }

    result = Array.from(result);
  }

  result = result.map((s) => s.trim()).map(encodeURI);

  if (options.close !== undefined) {
    options.close().then(() => browser.close());
    return result;
  }

  await browser.close();
  return result;
};
