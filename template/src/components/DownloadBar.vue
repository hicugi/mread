<script>
import { inject } from "vue";
import { fetchImages } from "../helper/main.js";

const DOWNLOAD_IMAGE_LIMIT = 4;

function getStyle(obj) {
  const { current, total } = obj;
  const val = ((current / (total / 100)) * 0.01).toFixed(5);

  return { transform: `scaleX(${val})` };
}

export default {
  inject: ["getUrl"],
  props: ["info"],
  data() {
    return {
      main: { current: 0, total: 0 },
      internal: { current: 0, total: 0 },
    };
  },

  computed: {
    text() {
      return [this.main.current, this.main.total].join(" / ");
    },
    mainStyle() {
      return getStyle(this.main);
    },
    internalStyle() {
      return getStyle(this.internal);
    },
  },

  async beforeMount() {
    const { alias, name, image, chapters, callback } = this.$props.info;
    const { main, internal } = this;

    main.current = 0;
    main.total = chapters.length;

    // sent cover image
    if (image.substring(0, 4) != "data") {
      const value = [alias, name, this.getUrl(image)].join("|");
      flSyncManga.postMessage(value);
    }

    for (const chapter of chapters) {
      const chapterName = chapter.name;

      if (chapter.isDownloaded) continue;

      const data = await fetchImages(alias, chapterName);

      internal.current = 0;
      internal.total = data.length;

      let imgIndex = 0;
      let loadingImagesCount = 0;

      window.flImageDownloaded = () => {
        loadingImagesCount -= 1;
        internal.current = internal.current + 1;
      };

      await new Promise((resolve) => {
        const imgsInterval = setInterval(() => {
          if (data[imgIndex] === undefined) {
            if (loadingImagesCount === 0) {
              clearInterval(imgsInterval);
              return resolve();
            }
            return;
          }

          if (loadingImagesCount >= DOWNLOAD_IMAGE_LIMIT) return;

          loadingImagesCount += 1;

          const url = this.getUrl(data[imgIndex]);
          const fileName = url.split("/").at(-1);
          imgIndex += 1;

          window.flDownloadImage.postMessage(
            [url, alias, chapterName, fileName, data.length].join("|")
          );
        }, 200);
      });

      main.current = main.current + 1;
    }

    this.$emit("success");
    callback();
  },
};

</script>

<template>
  <div class="downloadState">
    <span>{{ text }}</span>
    <span class="downloadState__progress downloadState__progress_main" :style="mainStyle" />
    <span class="downloadState__progress downloadState__progress_internal" :style="internalStyle" />
  </div>
</template>

<style>
.downloadState {
  --size: 14px;

  position: fixed;
  left: 0;
  bottom: 0;
  padding: 8px 0;
  border: 1px solid white;
  border-width: 0 1px;
  width: 100%;
  display: block;
  background-color: #4c4c4c;
  font-size: var(--size);
  line-height: var(--size);
  text-align: center;
}

.downloadState__progress {
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  transform-origin: left center;
  transition: easy-out 0.2s;
  will-change: transform;
}
.downloadState__progress_internal {
  top: auto;
  bottom: 0;
  height: 3px;
  background-color: #fff;
}
</style>
