import { inject, ref, onBeforeMount, onMounted } from "vue";

import Cover from "../../components/Cover.vue";
import Card from "./Card.vue";
import UiButton from "../../components/ui/Button.vue";

import { isApp, HOST_URL_KEY } from "../../helper/main.js";
import { lastReadManga, savedChapters } from "../../helper/global.js";
import { api } from "../../api.js";

import iconRead from "./iconRead.svg";
import iconContinue from "./iconContinue.svg";

const list = ref([]);
const listOnDevice = ref([]);

export default {
  components: {
    Cover,
    Card,
    UiButton,
  },

  data: () => ({
    iconRead,
    iconContinue,

    savedChapters,
    list,
    listOnDevice,
  }),

  computed: {
    combinedList() {
      const online = this.list;
      const local = this.listOnDevice;

      if (!online.length) return local;
      if (!local.length) return online;

      const res = local;
      const memo = Object.fromEntries(res.map(({ alias }) => [alias, true]));

      for (const item of online) {
        if (memo[item.alias]) continue;
        res.push(item);
      }

      res.sort((a, b) => a.name.localeCompare(b.name));

      return res;
    },

    onTop() {
      const list = this.combinedList;
      if (!list.length) return null;

      const lastRead = list.find((item) => item?.alias == lastReadManga.value);
      const topItem = list.find((item) => item.isTop);
      const item = lastRead ?? topItem;

      return item;
    },
  },

  methods: {
    clearTemplate() {
      if (confirm("Clear template?")) {
        flClearCache.postMessage("");
        return;
      }
    },

    clearAll() {
      if (confirm("Remove & Clear everything?")) {
        flRemoveAll.postMessage("");
        return;
      }
    },
  },

  setup() {
    const store = inject("store");

    onBeforeMount(() => {
      store.clear();

      window.appClearMangaList = () => {
        listOnDevice.value = [];
      };

      window.appInsertManga = (data) => {
        const res = [...listOnDevice.value];
        const idx = res.findIndex((item) => item.alias === data.alias);

        if (idx === -1) {
          listOnDevice.value.push(data);
          return;
        }

        res[idx] = {
          ...res[idx],
          ...data,
        };
        listOnDevice.value = res;
      };
    });

    onMounted(async () => {
      if (isApp) {
        if (!window?.isListSynced) {
          window.isListSynced = true;
          flFetchMangaList.postMessage("");
          flFetchSaves.postMessage("");
        }

        await new Promise((ok) => {
          const interval = setInterval(() => {
            if (window[HOST_URL_KEY]) {
              clearInterval(interval);
              ok();
            }
          }, 100);
        });
      }

      api
        .get("/list")
        .then((data) => {
          list.value = data;
        })
        .catch((err) => {
          console.error(err);
        });
    });
  },
};
