import path from "node:path";

import type { Plugin } from "vite";
import type { OutputAsset } from "rollup";
import { createFilter, normalizePath } from "@rollup/pluginutils";
import type { BundleCssOptions } from "./types";

const defaults: BundleCssOptions = {
  fileName: "bundle.css",
  include: "**/*.css",
  exclude: ["**/node_modules/**"],
  mode: "import",
};

export default function bundleCss(options: BundleCssOptions = {}): Plugin {
  const mergedOptions = {
    ...defaults,
    ...options,
  } as Required<BundleCssOptions>;
  const filter = createFilter(mergedOptions.include, mergedOptions.exclude);

  return {
    name: "vite-plugin-bundle-css",
    generateBundle(_, bundle) {
      const cssFiles = Object.values(bundle).filter(
        (file) => file.type === "asset" && filter(file.fileName),
      ) as OutputAsset[];

      if (cssFiles.length === 0) {
        return;
      }

      let fileContent: string;

      switch (mergedOptions.mode) {
        case "import": {
          fileContent = cssFiles
            .map((file) => {
              const bundleFilePath = path.dirname(mergedOptions.fileName);
              const cssFilePath = path.dirname(file.fileName);

              const relativePath = path.relative(bundleFilePath, cssFilePath);

              const importPath = normalizePath(
                path.join(relativePath, path.basename(file.fileName)),
              );

              return `import "${importPath}";`;
            })
            .join("\n");


          break;
        }
        case "inline": {
          fileContent = cssFiles.map((file) => file.source).join("\n");
          break;
        }
        default:
          throw new Error(`Invalid mode: ${mergedOptions.mode}`);
      }

      this.emitFile({
        type: "asset",
        fileName: mergedOptions.fileName,
        source: fileContent,
      });
    },
  };
}
