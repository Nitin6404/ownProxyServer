module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended', // Add this line
    ],
    rules: {
      // Customize rules as needed
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Allow console for this project since it's a CLI tool
    },
    env: {
      node: true,
      es6: true,
    },
    ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  };