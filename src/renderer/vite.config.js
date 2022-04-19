import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const path = require("path");
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  root: "src/renderer",
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        config: "./src/renderer/config.html",
        display: "./src/renderer/display.html",
      },
    },
  },

  server: {
    strictPort: true,
    port: 3000,
  },
});
