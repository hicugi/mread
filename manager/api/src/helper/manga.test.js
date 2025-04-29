import { getChapterNumber } from "./manga.js";

test("Chapter converter from string to number working correctly", () => {
  [
    ["0", 0], ["1", 1], ["99", 99], ["24.1", 24.1], ["26.04", 26.04],
    ["12-3", 12.3], ["12-3-4", 12.304], ["12,3-4", 12.304], ["12,3_4-5", 12.304005]
  ].forEach(([a, b]) => {
    expect(a).toBe(b);
  });
});

