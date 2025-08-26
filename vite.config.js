import { resolve } from "path";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [glsl()],
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
