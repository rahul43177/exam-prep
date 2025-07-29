module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Error prevention
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': 'off', // Allow console in Node.js
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-await-in-loop': 'warn',
    'no-return-await': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Code style
    'indent': ['error', 2, { 
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1
    }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],

    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'dot-notation': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-loop-func': 'error',
    'no-new-func': 'error',
    'no-param-reassign': 'warn',
    'no-return-assign': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'radix': 'error',
    'require-await': 'error',

    // Node.js specific
    'callback-return': 'error',
    'global-require': 'error',
    'handle-callback-err': 'error',
    'no-mixed-requires': 'error',
    'no-new-require': 'error',
    'no-path-concat': 'error',
    'no-process-exit': 'error',
    'no-sync': 'warn'
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-expressions': 'off',
        'no-process-exit': 'off'
      }
    }
  ]
};