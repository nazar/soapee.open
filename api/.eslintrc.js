module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended'
  ],
  env: {
    es6: true,
    node: true
  },
  rules: {
    quotes: [2, 'single', { avoidEscape: true }],
    semi: 1,
    'object-curly-spacing': [1, 'always'],
    'comma-dangle': [1, 'never'],
    'comma-spacing': [2],
    'no-console': [1, { allow: ['warn', 'error'] }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
    ],
    'func-style': ['error', 'declaration'],
    'eol-last': ['error'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],

    'import/prefer-default-export': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always-and-inside-groups'
    }],
    'import/no-unresolved': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': [0],

    // disabled - makes debgging more difficult
    'arrow-body-style': [0],

    // IMHO, more sensible overrides to existing airbnb error definitions
    'no-underscore-dangle': [2, { 'allow': ['__knexQueryUid'] }],
    'max-len': [2, 120, 4, { 'ignoreComments': true, 'ignoreUrls': true }],
    'no-multi-spaces': [2, {
      'exceptions': { 'VariableDeclarator': true, 'Property': true },
      'ignoreEOLComments': true
    }],
    'no-unused-expressions': [2, { 'allowShortCircuit': true, 'allowTernary': true }],
    'no-use-before-define': [2, { 'variables': false, 'functions': false }],
    'no-param-reassign': [2, { 'props': false }],
    'no-cond-assign': [2, 'except-parens'],
    'no-return-assign': [2, 'except-parens'],
    'no-else-return': [0],
    'implicit-arrow-linebreak': [0],
    'object-curly-newline': [0],
    'func-names': [2, 'never'],
    'operator-linebreak': ['error', 'after'],
    'newline-per-chained-call': [0]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
        paths: ['./src']
      }
    }
  }
};
