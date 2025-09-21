import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';

export default tseslint.config(
    ...tseslint.configs.recommended,
    prettierConfig, // Désactive les règles ESLint en conflit avec Prettier
    {
        plugins: {
            prettier,
        },
        rules: {
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
    }
);
