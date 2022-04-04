import { defineConfig } from "vite";
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'assets',
  plugins: [],
  server: {
    proxy: {
      '/api': 'http://localhost:8042',
      '/static': 'http://localhost:8042',
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'assets/main.ts'),
      formats: ['es'],
      name: 'main',
      fileName: 'main'
    },
    rollupOptions: {
      output: { entryFileNames: "[name].js" },
    },
    outDir: resolve(__dirname, 'static'),
    emptyOutDir: false,
  },
});
