import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "style.css",
        entryFileNames: "script.js",
      },
    },
  },

  server: {
    host: "0.0.0.0",
  },

  plugins: [vue()],
});
