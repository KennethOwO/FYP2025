import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import mkcert from 'vite-plugin-mkcert'; // ADD THIS

export default defineConfig({
  plugins: [react(), mkcert()], // ADD mkcert to plugins
  resolve: {
    alias: {
      "@root": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    https: true // ENABLE HTTPS
  },
});
