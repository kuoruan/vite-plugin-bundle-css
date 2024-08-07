import type { OutputAsset, RollupOutput } from "rollup";

export function getAssetOutputs(data: RollupOutput[]): OutputAsset[] {
  return data[0].output
    .filter((item) => item.type === "asset")
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
}
