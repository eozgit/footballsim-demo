import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import n from 'eslint-plugin-n';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite', 'coverage'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  stylistic.configs['disable-legacy'],
  stylistic.configs.recommended,

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
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
      n,
      unicorn,
      '@stylistic': stylistic,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',

      // --- LOGIC SAFETY (Synced with Lib) ---
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-identical-functions': 'error',
      complexity: ['error', 12],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],

      // --- IMPORT DISCIPLINE & AI OPTIMIZATION ---
      'import/no-default-export': 'error', // Named exports for better AI/refactoring
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // --- UNUSED CODE (Agent Optimized) ---
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // --- HARDENED TYPE SAFETY ---
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // --- STYLISTIC (Synced with Lib & Prettier) ---
      '@stylistic/semi': ['error', 'always'], // Sync with .prettierrc
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'always', prev: 'block-like', next: '*' },
      ],

      // --- MODERN STANDARDS (Unicorn & WinterCG) ---
      'unicorn/filename-case': ['error', { case: 'camelCase' }],
      'n/prefer-global/buffer': ['error', 'never'],
      'n/prefer-global/process': ['error', 'never'],
      'no-restricted-globals': [
        'error',
        { name: 'Buffer', message: 'Use Uint8Array for WinterCG compliance.' },
        { name: 'process', message: 'Use environment detection instead.' },
      ],

      // --- NAMING CONVENTION (AI Readiness) ---
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],

      // --- UI-SPECIFIC SAFETY ---
      'no-restricted-syntax': [
        'error',
        { selector: 'ForInStatement', message: 'Use for..of or Object.keys().' },
        { selector: 'LabeledStatement', message: 'Labels are forbidden.' },
        { selector: 'SequenceExpression', message: 'The comma operator is forbidden.' },
        {
          selector: 'TSEnumDeclaration',
          message: 'Use const objects or union types instead of Enums.',
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
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Ensure config files don't use type-checked rules
  {
    files: ['*.mjs', '*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  eslintConfigPrettier, // Must be last
);
