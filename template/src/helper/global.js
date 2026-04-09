import { ref } from "vue";

export const lastReadManga = ref(null);
export const savedChapters = ref({});

window.savedChapters = savedChapters;

window.appSetLastReadManga = (alias) => {
  lastReadManga.value = alias;
}
window.appSyncLastReadedChapter = (alias, value) => {
  savedChapters.value = {
    ...savedChapters.value,
    [alias]: value,
  };
}
