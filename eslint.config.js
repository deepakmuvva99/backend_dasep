const js = require('@eslint/js');
const security = require('eslint-plugin-security');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            security: security,
            prettier: prettier,
        },
        rules: {
            // Prettier Integration
            'prettier/prettier': 'error',

            // Security Rules (Production Essential)
            ...security.configs.recommended.rules,
            'security/detect-object-injection': 'warn', // Useful but can be noisy, set to warn
            'security/detect-non-literal-fs-filename': 'warn',

            // Logic & Best Practices
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-process-exit': 'error',
            'handle-callback-err': 'error',

            // Specific to our project needs
            'no-nested-ternary': 'error',
            'no-unused-expressions': 'error',
            'no-param-reassign': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            complexity: ['error', 15], // Enforce the complexity rule we fixed earlier
        },
    },
    prettierConfig, // Always put this last to disable conflicting rules
];
