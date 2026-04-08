import { ref, onMounted } from "vue";

import Card from "./Card.vue";
import UiButton from "../../components/ui/Button.vue";

import { isApp, HOST_URL_KEY, getImgUrl } from "../../helper/main.js";
import { api } from "../../api.js";

import iconRead from "./iconRead.svg";

const list = ref([]);

export default {
  components: {
    Card,
    UiButton,
  },

  data: () => ({
    iconRead,

    list,
    listOnDevice: [],
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
      const item = this.combinedList.find((item) => item.isTop);
      if (!item) return undefined;

      return {
        ...item,
        image: getImgUrl(item.image),
      };
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
    onMounted(async () => {
      if (isApp) {
        flFetchMangaList.postMessage("");

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

  onBeforeMount: () => {
    window.appClearMangaList = () => {
      this.listOnDevice = [];
    };

    window.appInsertManga = (data) => {
      this.listOnDevice = [...this.listOnDevice, data];
    };
  },
};
