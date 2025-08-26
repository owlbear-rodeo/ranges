import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "background.html"),
      },
    },
  },
  server: {
    cors: {
      origin: "https://www.owlbear.rodeo",
    },
  },
});
