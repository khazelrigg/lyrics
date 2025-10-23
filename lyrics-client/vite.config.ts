// shadcn imports
import path from "path";
import tailwindcss from "@tailwindcss/vite";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,

    proxy: {
      "/api": {
        target: "http://localhost:8000", // inside container
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },

    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
