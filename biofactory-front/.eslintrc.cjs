module.exports = {
  root: true,
  env: { browser: true, es2021: true, 'vitest/globals': true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:vitest/recommended',
    './.eslintrc-auto-import.json', // auto-import自動生成的 ESLint 配置檔，用來告訴 ESLint 自動匯入了哪些全域變數或函式，避免報 no-undef 或 jsx-no-undef 類型的錯誤。
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/prop-types': 'off',
    'no-undef': 'error',
    'react/jsx-no-undef': ['error', { allowGlobals: true }],
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx}'],
      env: {
        'vitest/globals': true,
      },
    },
  ],
};
