import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
    {
        ignores: ['**/build/**', '**/dist/**', '**/node_modules/**', '**/*.js']
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            'quotes': ['error', 'single'],
            'no-unused-vars': 'off',  // Disable the base rule
            'semi': ['error', 'never'],
            '@typescript-eslint/no-unused-vars': ['error', {
                'argsIgnorePattern': '^_',
                'varsIgnorePattern': '^_',
                'ignoreRestSiblings': true,
                'args': 'none'
            }],
            '@typescript-eslint/no-explicit-any': 'error'
        }
    },
])
