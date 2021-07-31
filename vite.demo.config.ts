import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
      output: {
        dir: "demo/public",
      },
    },
  },
});
