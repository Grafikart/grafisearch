import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 3000,
    cors: true,
  },
  base: "/",
  build: {
    manifest: true,
    outDir: "./public/assets/",
    rollupOptions: {
      input: {
        main: "./assets/main.tsx",
      },
      output: {
        entryFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
        chunkFileNames: "[name]-[hash][extname]",
      },
    },
  },
});
