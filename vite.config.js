import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // ← relative paths
  plugins: [react()],
  build: { outDir: "build" },
});
