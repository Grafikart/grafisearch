import { defineConfig } from "vite";
import { resolve } from "path";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "assets/app.ts"),
      formats: ["es"],
      name: "app",
      fileName: "app",
    },
    rollupOptions: {
      output: { entryFileNames: "[name].js" },
    },
    outDir: resolve(__dirname, "static"),
    emptyOutDir: false,
  },
});
