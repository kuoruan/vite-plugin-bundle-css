import type { FilterPattern } from "@rollup/pluginutils";

export interface BundleCssOptions {
  name?: string;
  fileName?: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
  transform?: (code: string, id: string) => string | Promise<string>;
  mode?: "import" | "inline";
}
