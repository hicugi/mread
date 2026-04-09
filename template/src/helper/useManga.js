import { inject, ref, watch } from "vue";
import { useRoute } from "vue-router";

const combineChapters = (local, online) => {
  if (!local?.length && !online?.length) return [];

  if (!local?.length) return online;
  if (!online?.length) return local;

  const localKeys = {};
  for (const item of local) {
    localKeys[item.name] = item;
  }

  const res = [...online];

  for (let i = 0; i < res.length; i++) {
    const item = res[i];

    if (localKeys[item.name] !== undefined) {
      const loc = localKeys[item.name];
      res[i] = {
        ...res[i],
        ...loc,
        isDownloaded: true,
      };
    }
  }

  return res;
};

window.chaptersAll = ref([]);

export const useManga = (alias) => {
  const store = inject("store");
  const route = useRoute();

  watch(() => store.getState().mangaInfo, () => {
    const { chaptersOnDevice, chaptersOnline } = store.getState().mangaInfo;
    chaptersAll.value = combineChapters(chaptersOnDevice, chaptersOnline);
  });

  window.appSyncMangaInfo = (payload) => {
    const { chapters, ...info } = payload;

    if (info?.alias !== alias) return;

    store.setState((prev) => ({
      ...prev,
      mangaInfo: {
        ...prev.mangaInfo,
        ...payload,
        chaptersOnDevice: chapters,
      },
    }));
  };

  window.appSyncDownloadedChapter = (payload) => {
    if (payload.alias !== route.params.alias) return;

    const { mangaInfo } = store.getState();
    const chaptersOnDevice = mangaInfo.chaptersOnDevice ?? [];

    const newValues = [...chaptersOnDevice, payload.chapter];

    store.setState((prev) => ({
      ...prev,
      mangaInfo: {
        ...mangaInfo,
        chaptersOnDevice: newValues,
      },
    }));
  };

  window.appDownloadComplete = () => {
    store.setState((prev) => ({
      ...prev,
      isDownloadInProgress: false,
    }));
  }

  return { chaptersAll };
};
