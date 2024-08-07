import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import eslintPluginSortDestructureKeys from "eslint-plugin-sort-destructure-keys";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginVitest from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/", "dist/"],
  },
  eslint.configs.recommended,
  eslintPluginUnicorn.configs["flat/recommended"],
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "simple-import-sort": eslintPluginSimpleImportSort,
      "sort-destructure-keys": eslintPluginSortDestructureKeys,
    },
    rules: {
      "sort-imports": "off",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

      "sort-destructure-keys/sort-destructure-keys": [
        "error",
        { caseSensitive: true },
      ],
    },
  },
  {
    rules: {
      "unicorn/no-null": "off",
    },
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    plugins: {
      vitest: eslintPluginVitest,
    },
    languageOptions: {
      ...eslintPluginVitest.configs.recommended.languageOptions,
    },
    rules: {
      ...eslintPluginVitest.configs.recommended.rules,
    },
  },
);
