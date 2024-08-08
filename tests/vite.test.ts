import type { RollupOutput } from "rollup";
import { build, mergeConfig, type UserConfig } from "vite";

import bundleCss from "@/index";

import { getAssetOutputs } from "./utils";
import viteConfig from "./vite.config";

describe("vite", () => {
  it("should build", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        lib: {
          entry: "/fixtures/css.ts",
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [bundleCss()],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with import mode", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        cssCodeSplit: true,
        lib: {
          entry: "/fixtures/css.ts",
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          mode: "import",
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with fileName", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        lib: {
          entry: "/fixtures/css.ts",
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          fileName: "assets/bundle.css",
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with filter", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        lib: {
          entry: "/fixtures/scss.ts",
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          include: ["**/*.js"],
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with transform", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        lib: {
          entry: "/fixtures/css.ts",
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          transform: (code) => {
            return code.replaceAll("color", "background-color");
          },
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with filter in import mode", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        cssCodeSplit: true,
        lib: {
          entry: ["/fixtures/scss.ts", "/fixtures/css.ts"],
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          include: ["**/css.css"],
          mode: "import",
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it("should build with multiple entries", async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        cssCodeSplit: true,
        lib: {
          entry: ["/fixtures/css.ts", "/fixtures/scss.ts"],
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [bundleCss()],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });

  it('should build with "import" mode in multiple entries', async () => {
    const config = mergeConfig<UserConfig, UserConfig>(viteConfig, {
      build: {
        cssCodeSplit: true,
        lib: {
          entry: ["/fixtures/css.ts", "/fixtures/scss.ts"],
          formats: ["es"],
          fileName: "[name].js",
        },
      },
      plugins: [
        bundleCss({
          mode: "import",
        }),
      ],
    });

    const data = (await build(config)) as RollupOutput[];

    expect(getAssetOutputs(data)).toMatchSnapshot();
  });
});
