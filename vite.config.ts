import { defineConfig, lazyPlugins } from "vite-plus";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [preact()]),
  server: {
    port: 3000,
    cors: true,
  },
  base: "/",
  publicDir: false,
  build: {
    manifest: true,
    outDir: "./public/assets/",
    rolldownOptions: {
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
