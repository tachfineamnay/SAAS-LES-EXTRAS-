import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", ".next", "**/*.e2e.*"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/cache": path.resolve(__dirname, "./src/__mocks__/next-cache.ts"),
      "next/headers": path.resolve(__dirname, "./src/__mocks__/next-headers.ts"),
      "server-only": path.resolve(__dirname, "./src/__mocks__/server-only.ts"),
    },
  },
});
