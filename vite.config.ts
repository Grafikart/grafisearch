import { defineConfig } from "vite";
import { resolve } from "path";
import solid from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [solid()],
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
