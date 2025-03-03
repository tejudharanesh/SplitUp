import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "SplitUp",
        short_name: "SplitUp",
        description: "Split expenses with friends and colleagues",
        theme_color: "#ffffff",
        icons: [
          {
            src: "./src/assets/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./src/assets/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "./src/assets/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
