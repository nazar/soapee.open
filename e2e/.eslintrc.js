module.exports = {
  extends: [
    'eslint:recommended'
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  globals: {
    'after': true,
    'before': true,
    'context': true,
    'cy': true,
    'expect': true,
    'Cypress': true
  },
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
    semi: 2,
    'object-curly-spacing': [1, 'always'],
    'comma-dangle': [1, 'never'],
    'no-console': [1, { allow: ['warn', 'error'] }],
    'newline-after-var': ['error', 'always'],
    'func-style': ['error', 'declaration'],
    'eol-last': ['error'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
    'curly': ['error']
  }
};
