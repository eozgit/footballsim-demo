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
import n from 'eslint-plugin-n';

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
      n,
      unicorn,
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

      // --- WINTERCG / TC55 COMPLIANCE ---
      'n/no-deprecated-api': 'error',
      'n/no-extraneous-import': 'error',
      'n/prefer-global/buffer': ['error', 'never'], // Forces TextEncoder/Uint8Array
      'n/prefer-global/process': ['error', 'never'], // Forces feature detection

      // Force Web Standards
      'no-restricted-globals': [
        'error',
        { name: 'Buffer', message: 'Use Uint8Array instead for WinterCG compliance.' },
        { name: 'process', message: 'Use environment detection or globalThis instead.' },
        { name: '__dirname', message: 'Use import.meta.url instead.' },
        { name: '__filename', message: 'Use import.meta.url instead.' },
      ],
      // --- IMPORT DISCIPLINE ---
      'import/no-deprecated': 'warn',
      'import/no-extraneous-dependencies': 'error', // Error if importing something not in package.json
      // --- COMPLEXITY & READABILITY (The "Agent Readiness" Gap) ---
      'max-lines-per-function': ['warn', { max: 70, skipBlankLines: true }], // Slightly higher for React components
      complexity: ['warn', 12],
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],
      // Add this to your rules block
      'no-restricted-syntax': [
        'error',
        // 1. Ban for..in (Iterates over prototypes, slow, often causes bugs)
        {
          selector: 'ForInStatement',
          message:
            'for..in iterates over the prototype chain. Use for..of or Object.keys/entries().',
        },
        // 2. Ban Labels/GOTO (Makes execution flow unpredictable)
        {
          selector: 'LabeledStatement',
          message: 'Labels are GOTO in disguise. Refactor logic into smaller, pure functions.',
        },
        // 3. Ban Sequence Expressions (The comma operator: a, b, c)
        // This prevents: return x++, y++, z; (which is a nightmare to debug)
        {
          selector: 'SequenceExpression',
          message:
            'The comma operator is confusing and obscures return values. Use multiple statements.',
        },
        // 4. Ban TypeScript Enums (Optional but Recommended for WinterCG)
        // Enums have weird runtime behavior. Const objects + Union types are safer.
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const objects with "as const" or union types instead of Enums.',
        },
        // 5. Ban Class Private Fields (Optional)
        // Unless you really need #private, standard private/protected is better for sim-engines.
        {
          selector: 'PropertyDefinition[accessible="private"]',
          message:
            'Use TypeScript "private" keyword instead of "#" for better readability and sim performance.',
        },
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
  prettierConfig,
);
