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
  } as const;

  const filter = createFilter(mergedOptions.include, mergedOptions.exclude);

  const cssModules = new Map<string, string>();

  return {
    name: "vite:bundle-css",
    buildStart() {
      cssModules.clear();
    },
    transform(code, id) {
      if (filter(id)) {
        cssModules.set(id, code);
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

          fileContent =
            assets
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
              .join("\n") + "\n";

          break;
        }
        case "inline": {
          // get the module ids in the order they were imported
          const moduleIds = [...this.getModuleIds()];
          const cssModuleIds = [...cssModules.keys()];

          // sort the css module ids based on the order they were imported
          const sortedCssModuleIds = [...cssModuleIds].sort((a, b) => {
            let aIndex = cssModuleIds.indexOf(a);
            let bIndex = cssModuleIds.indexOf(b);

            const aModuleInfo = this.getModuleInfo(a);
            const bModuleInfo = this.getModuleInfo(b);

            let aFirstImporterId: string | undefined;
            let bFirstImporterId: string | undefined;

            if (aModuleInfo) {
              // get the first importer id and its index
              const { dynamicImporters, importers } = aModuleInfo;

              for (const importerId of new Set([
                ...dynamicImporters,
                ...importers,
              ])) {
                const importerIndex = moduleIds.indexOf(importerId);
                if (importerIndex > -1 && importerIndex <= aIndex) {
                  aFirstImporterId = importerId;
                  aIndex = importerIndex;
                }
              }
            }

            if (bModuleInfo) {
              const { dynamicImporters, importers } = bModuleInfo;

              for (const importerId of new Set([
                ...dynamicImporters,
                ...importers,
              ])) {
                const importerIndex = moduleIds.indexOf(importerId);
                if (importerIndex > -1 && importerIndex <= bIndex) {
                  bFirstImporterId = importerId;
                  bIndex = importerIndex;
                }
              }
            }

            // if the modules have the same importer id and index, sort them based on the order they were imported
            if (
              aIndex === bIndex &&
              !!aFirstImporterId &&
              aFirstImporterId === bFirstImporterId
            ) {
              // get the module info of the first importer
              const importerModuleInfo = this.getModuleInfo(aFirstImporterId);

              if (importerModuleInfo) {
                // get the index of the module in the importer's imported ids
                const aImportedIndex = Math.min(
                  ...[
                    importerModuleInfo.dynamicallyImportedIds.indexOf(a),
                    importerModuleInfo.importedIds.indexOf(a),
                  ].filter((item) => item > -1),
                );
                const bImportedIndex = Math.min(
                  ...[
                    importerModuleInfo.dynamicallyImportedIds.indexOf(b),
                    importerModuleInfo.importedIds.indexOf(b),
                  ].filter((item) => item > -1),
                );

                return aImportedIndex - bImportedIndex;
              }
            }

            return aIndex - bIndex;
          });

          fileContent =
            sortedCssModuleIds
              .map((id) => cssModules.get(id)?.trim())
              .filter(Boolean)
              .join("\n") + "\n";
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
