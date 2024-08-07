/// <reference types="vitest" />

import path from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import package_ from "./package.json";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, "src/index.ts"),
    },
    minify: false,
    rollupOptions: {
      output: [
        {
          entryFileNames: "[name].js",
          chunkFileNames: "[name].js",
          format: "es",
        },
        {
          entryFileNames: "[name].cjs",
          chunkFileNames: "[name].cjs",
          format: "cjs",
        },
      ],
      external: [
        "node:path",
        ...Object.keys(package_.dependencies),
        ...Object.keys(package_.peerDependencies),
      ],
    },
  },
  plugins: [
    dts({
      exclude: ["tests/**/*", "vite.config.ts"],
    }),
  ],
  test: {
    globals: true,
    include: ["tests/*.{test,spec}.ts"],
  },
});
