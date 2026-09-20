import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/core.ts",
        "src/store.ts",
        "src/index.ts",
        "src/server.ts",
        "src/markdown.ts",
      ],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 80 },
    },
  },
});
