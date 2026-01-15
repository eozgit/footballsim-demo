import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import'; // NEW
import unusedImports from 'eslint-plugin-unused-imports'; // NEW
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite', 'coverage'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  // Block 1: Infrastructure & Build Files (JS/MJS)
  {
    files: ['*.js', '*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Block 2: Strict TypeScript & React rules for src
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.test.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin, // NEW
      'unused-imports': unusedImports, // NEW
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',

      // --- IMPORT DISCIPLINE ---
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- AGENT-OPTIMIZED UNUSED CODE REMOVAL ---
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // --- STRICT TYPE SAFETY ---
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: false },
      ],
      // --- THE GOOD PARTS: UI PREDICTABILITY ---
      'sonarjs/no-nested-template-literals': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      // --- THE GOOD PARTS: PREVENTING "FOOT-SHOOTING" ---
      '@typescript-eslint/no-floating-promises': 'error', // Must await/catch async calls
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // --- MODERN SAFETY (Unicorn) ---
      'unicorn/no-array-reduce': 'warn', // Prefer for-of for engine performance
      'unicorn/prefer-module': 'error',
      'unicorn/no-null': 'warn', // Discourages null, encourages undefined/optional
      'unicorn/filename-case': ['error', { case: 'camelCase' }],

      // --- IMPORT DISCIPLINE ---
      'import/no-deprecated': 'warn',
      'import/no-extraneous-dependencies': 'error', // Error if importing something not in package.json
      // --- COMPLEXITY & READABILITY (The "Agent Readiness" Gap) ---
      'max-lines-per-function': ['warn', { max: 70, skipBlankLines: true }], // Slightly higher for React components
      'complexity': ['warn', 12],
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
    },
    settings: { react: { version: 'detect' } },
  },

  // Block 3: Test Overrides
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/setup.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'max-lines-per-function': 'off',
    },
  },
  prettierConfig
);
