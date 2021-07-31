import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRefresh()],
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
