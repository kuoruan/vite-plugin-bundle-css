import path from "node:path";

import { createFilter, normalizePath } from "@rollup/pluginutils";
import type { Plugin } from "vite";

import type { BundleCssOptions } from "./types";

const defaults = {
  name: "bundle.css",
  fileName: "bundle.css",
  include: ["**/*.s[ca]ss", "**/*.less", "**/*.styl", "**/*.css"],
  exclude: ["**/node_modules/**"],
  mode: "inline",
} satisfies BundleCssOptions;

export default function bundleCss(options: BundleCssOptions = {}): Plugin {
  const mergedOptions = {
    ...defaults,
    ...options,
  };

  const filter = createFilter(mergedOptions.include, mergedOptions.exclude);

  let cssCodes: Set<string> | null = null;

  return {
    name: "vite:bundle-css",
    buildStart() {
      if (mergedOptions.mode === "inline") {
        cssCodes = new Set();
      }
    },
    transform(code, id) {
      if (filter(id)) {
        cssCodes?.add(code);
      }

      return null;
    },
    async generateBundle(_, bundle) {
      let fileContent: string;

      switch (mergedOptions.mode) {
        case "import": {
          const assets = Object.values(bundle).filter(
            (file) => file.type === "asset" && filter(file.fileName),
          );

          fileContent = assets
            .map((file) => {
              const bundleFilePath = path.dirname(mergedOptions.fileName);

              const cssFilePath = path.dirname(file.fileName);
              const cssFileName = path.basename(file.fileName);

              const relativePath = path.relative(bundleFilePath, cssFilePath);

              let importPath = normalizePath(
                path.join(relativePath, cssFileName),
              );

              // always use relative import path
              if (!importPath.startsWith(".")) {
                importPath = `./${importPath}`;
              }

              return `@import "${importPath}";`;
            })
            .join("\n");

          break;
        }
        case "inline": {
          fileContent = [...(cssCodes ?? [])].filter(Boolean).join("\n");
          break;
        }
        default: {
          throw new Error(`Invalid mode: ${String(mergedOptions.mode)}`);
        }
      }

      if (typeof mergedOptions.transform === "function") {
        fileContent = await mergedOptions.transform(
          fileContent,
          mergedOptions.fileName,
        );
      }

      this.emitFile({
        type: "asset",
        fileName: mergedOptions.fileName,
        name: mergedOptions.name,
        source: fileContent,
      });
    },
  };
}
