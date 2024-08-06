import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
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
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ],
    },
  },
  plugins: [dts()],
});
