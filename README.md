# vite-plugin-bundle-css

Bundle CSS files into one file. useful for bundling CSS files in a library.

## Install

```bash
npm install vite-plugin-bundle-css --save-dev
```

## Usage

```js
// vite.config.js
import bundleCss from "vite-plugin-bundle-css";

export default {
  build: {
    cssCodeSplit: true,
    lib: {
      entry: ["src/a.js", "src/b.js"],
      formats: ["es"],
      fileName: "[name].js",
    },
  },
  plugins: [
    bundleCss({
      // options
    }),
  ],
};
```

## Options

| Name      | Type                                          | Required | Default                                                  | Description                                                                                                                                |
| --------- | --------------------------------------------- | -------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| name      | `string`                                      | false    | `'bundle.css'`                                           | The name of the output file.                                                                                                               |
| fileName  | `string`                                      | false    | `'bundle.css'`                                           | The output file path of the output file, relative to the `build.outDir`.                                                                   |
| include   | `string[] \| RegExp[] \| string \| RegExp`    | false    | `["**/*.s[ca]ss", "**/*.less", "**/*.styl", "**/*.css"]` | The CSS files to include.                                                                                                                  |
| exclude   | `string[] \| RegExp[] \| string \| RegExp`    | false    | `["**/node_modules/**"]`                                 | The CSS files to exclude.                                                                                                                  |
| mode      | `'inline' \| 'import'`                        | false    | `'inline'`                                               | The mode of the output CSS. `'inline'` means inline the CSS into the output file, `'import'` means import the CSS file in the output file. |
| transform | `(code: string) => string \| Promise<string>` | false    |                                                          | The transform function of the bundled CSS code.                                                                                            |

## Inline Mode

In inline mode, the CSS code will be inlined into the output file.

For example, we have a folder structure like this:

```
src/
  a/
    a.scss
    index.js
  b/
    b.scss
    index.js
```

```css
/* src/a/a.scss */
.a {
  color: red;
}
```

```css
/* src/b/b.scss */
.b {
  color: blue;
}
```

```js
// src/a/index.js
import "./a.scss";

export default "a";
```

```js
// src/b/index.js
import "./b.scss";

export default "b";
```

with the following configuration:

```js
// vite.config.js
import bundleCss from "vite-plugin-bundle-css";

export default {
  build: {
    cssCodeSplit: true,
    lib: {
      entry: ["src/a/index.js", "src/b/index.js"],
      formats: ["es"],
    },
  },
  plugins: [
    bundleCss({
      name: "bundle.css",
      fileName: "bundle.css",
      include: ["**/*.scss"],
      mode: "inline",
    }),
  ],
};
```

The output file will be like this:

```css
/* dist/bundle.css */
.a {
  color: red;
}
.b {
  color: blue;
}
```

***Note***: The bundle CSS code will not be minified. because of the plugin implementation.

If you want to minify the `bundoe.css` code, you can use the `transform` option:

```js
// vite.config.js
import { transform } from 'lightningcss';
import bundleCss from "vite-plugin-bundle-css";

export default {
  build: {
    cssCodeSplit: true,
    lib: {
      entry: ["src/a/index.js", "src/b/index.js"],
      formats: ["es"],
    },
  },
  plugins: [
    bundleCss({
      name: "bundle.css",
      fileName: "bundle.css",
      include: ["**/*.scss"],
      mode: "inline",
      transform: (code, id) => {
        const { code: minifiedCode } = transform({
          filename: id,
          code: Buffer.from(code),
          minify: true,
        });

        return minifiedCode.toString();
      },
    }),
  ],
};
```

# Import Mode

In import mode, the CSS code will be imported in the output file.

With above example, we have the following configuration:

```js
// vite.config.js
import bundleCss from "vite-plugin-bundle-css";

export default {
  build: {
    // css code split must be enabled in `import` mode
    cssCodeSplit: true,
    lib: {
      entry: ["src/a/index.js", "src/b/index.js"],
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
  plugins: [
    bundleCss({
      name: "bundle.css",
      fileName: "bundle.css",
      include: ["**/*.css"],
      mode: "import",
    }),
  ],
};
```

The output file will be like this:

```css
/* dist/bundle.css */
@import "./a/a.css";
@import "./b/b.css";
```

This is useful for components library development, users can import the `bundle.css` in the main entry file.

Or only import the component's CSS file used.

## The `include` and `exclude` options

- `inline` mode: The `include` and `exclude` options are used to filter the ***ORIGINAL*** CSS files to inline.
- `import` mode: The `include` and `exclude` options are used to filter the ***OUTPUT*** CSS files to import.
