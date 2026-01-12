import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite', 'coverage'] },
  js.configs.recommended,
  // Block 1: Shared rules for ALL files (JS/TS)
  {
    files: ['*.js', '*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Block 2: Strict TypeScript rules for src ONLY
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
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: false,
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      curly: 'error',
      '@typescript-eslint/no-require-imports': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/setup.ts'],
    rules: {
      // Allow unused 'vi' or 'getState' often used in testing setups
      '@typescript-eslint/no-unused-vars': 'off',
      // Relax explicit return types for tests to reduce boilerplate
      '@typescript-eslint/explicit-function-return-type': 'off',
      // NEW: Disable strict type-checking for mocks and testing shortcuts
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // Allow @ts-ignore for testing private methods/properties
      '@typescript-eslint/ban-ts-comment': 'off'
    },
  },
  prettierConfig
);
