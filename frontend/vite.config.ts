import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    port: 3000,
    proxy: {
      "/api": 'http://localhost:5000',
    },
    allowedHosts: ['7c33-103-184-170-184.ngrok-free.app']
  }
})
