import type { FilterPattern } from "@rollup/pluginutils";

export interface BundleCssOptions {
  fileName?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
  mode?: "import" | "inline";
}
