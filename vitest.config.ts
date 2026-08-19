import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Shell env on this machine exports NODE_ENV=production, which makes
// react-dom resolve production builds (React.act missing). Force test env.
(process.env as Record<string, string | undefined>).NODE_ENV = "test";

const srcAlias = {
  "@": fileURLToPath(new URL("./src", import.meta.url)),
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias: srcAlias },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    // jsdom for component tests only; node for everything else so node:
    // built-ins resolve. Vitest 4: per-file overrides via `projects`.
    projects: [
      {
        resolve: { alias: srcAlias },
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: srcAlias },
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["tests/setup.ts"],
          include: ["tests/**/*.test.tsx"],
        },
      },
    ],
  },
});
