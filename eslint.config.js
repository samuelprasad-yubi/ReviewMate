import globals from "globals";
import pluginJs from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            ecmaVersion: 2020,
            sourceType: "module",
            parser: typescriptParser,
        },
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            react: pluginReact,
            prettier: prettierPlugin,
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...typescriptPlugin.configs.recommended.rules,
            ...pluginReact.configs.flat.rules,
            "no-console": "warn",
        },
        settings: {
            react: {
                version: "detect", // Automatically detect the React version
            },
        },
    },
    // Prettier config to override any conflicting ESLint rules
    prettierConfig,
];
