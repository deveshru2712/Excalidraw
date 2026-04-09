import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['**/dist/**', '**/node_modules/**', '**/build/**']),

    // all packages — base TS rules
    {
        files: ['packages/**/*.{ts,tsx}'],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
        },
    },

    // client only — React rules
    {
        files: ['packages/client/src/**/*.{ts,tsx}'],
        extends: [
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
        },
    },

    // server only — node globals
    {
        files: ['packages/server/**/*.ts'],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
