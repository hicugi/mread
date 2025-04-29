import path from "path";
import fs from "fs";
import { firefox } from "playwright";  // Or 'chromium' or 'firefox'.

export const openPage = async (url, evaluateProps, options) => {
  // "/home/mag/app/firefox/linux-nightly_140.0a1/firefox/firefox"
  const browser = await firefox.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setViewportSize({
    width: 1240,
    height: 8000,
  });
  await page.goto(url);

  const result = await page.evaluate(...evaluateProps);

  await browser.close();

  return result;
};
