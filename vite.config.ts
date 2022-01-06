import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import { defineConfig } from "vite";

const port = 3000;

export default defineConfig({
  server: {
    port,
    strictPort: true,
  },
  base: "./",
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib.ts"),
      formats: ["es", "cjs"],
      fileName: format => `editors.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
