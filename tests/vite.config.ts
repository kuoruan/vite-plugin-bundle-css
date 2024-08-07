import { defineConfig } from "vite";

export default defineConfig({
  root: import.meta.dirname,
  logLevel: "silent",
  build: {
    minify: true,
    write: false,
  },
});
