import globals from "globals";
import pluginJs from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            globals: globals.browser,
            ecmaVersion: 2020,
            sourceType: "module",
            parser: typescriptParser,
        },
        plugins: {
            "@typescript-eslint": typescriptPlugin,
            react: pluginReact,
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
            ...typescriptPlugin.configs.recommended.rules,
            ...pluginReact.configs.flat.rules,
        },
    },
];
