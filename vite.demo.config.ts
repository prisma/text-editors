import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: "demo/index.html",
      output: {
        dir: "demo/public",
      },
    },
  },
});
