import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/domain/**/*.ts"],
      exclude: ["src/domain/types.ts"],
      thresholds: {
        "src/domain/aero-engine/**/*.ts": {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
        "src/domain/flight-state/**/*.ts": {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 80,
        },
        "src/domain/audio-engine/**/*.ts": {
          lines: 90,
          functions: 90,
          statements: 90,
          branches: 90,
        },
        "src/domain/audio-runtime/**/*.ts": {
          lines: 85,
          functions: 85,
          statements: 85,
          branches: 70,
        },

        "src/domain/**/*.ts": {
          lines: 70,
          functions: 70,
          statements: 70,
          branches: 60,
        },
      },
    },
  },
});
