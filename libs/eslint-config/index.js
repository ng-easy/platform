module.exports = {
  plugins: ['prettier', 'json', 'import', 'unused-imports', 'deprecation', 'prefer-arrow', '@typescript-eslint', '@angular-eslint'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.html'],
      extends: ['plugin:prettier/recommended'],
      rules: {},
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
      ],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/ban-types': ['off'],
        'import/order': [
          'error',
          {
            pathGroups: [{ pattern: '@ng-*/**', group: 'internal', position: 'before' }],
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
            pathGroupsExcludedImportTypes: [],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'unused-imports/no-unused-imports': 'error',
        '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
        'import/no-unresolved': ['off'],
      },
      settings: {
        'import/resolver': {
          node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
          typescript: {},
        },
      },
    },
    {
      files: ['*.json'],
      extends: ['plugin:json/recommended'],
      rules: {
        'json/*': ['error', { allowComments: true }],
      },
    },
  ],
  rules: {},
};
