module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  plugins: ['react-prefer-function-component'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:react-prefer-function-component/recommended'
  ],
  env: {
    browser: true,
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
    'eol-last': ['error'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],

    'react/no-access-state-in-setstate': 'error',
    'react/jsx-indent': ['error', 2, { checkAttributes: true, indentLogicalExpressions: true }],
    'react/forbid-component-props': ['warn', { forbid: ['style'] }],
    'react/forbid-dom-props': ['warn', { forbid: ['style'] }],
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-handler-names': ['error'],
    'react/jsx-child-element-spacing': ['error'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-no-useless-fragment': ['error'],
    'react/jsx-wrap-multilines': ['error', { logical: 'parens', prop: 'parens' }],
    'react/jsx-fragments': ['error'],
    'react/jsx-closing-tag-location': ['error'],
    'react/jsx-closing-bracket-location': ['error'],
    'react/require-default-props': ['error'],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/no-unescaped-entities': 0,

    // set to warning for now but we want to fix these
    'react/jsx-no-bind': ['warn'],
    'react/prop-types': ['warn'],

    'import/prefer-default-export': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], 'newlines-between': 'always-and-inside-groups' }],
    'import/no-unresolved': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': [0],

    // WARNING: the exhaustive-deps often gives duff advise so always review warnings and disable the lint rule on lines
    // WARNING: add a comment to describe why the line warning was disabled for future reference
    'react-hooks/exhaustive-deps': ['warn', {
      'additionalHooks': '(useCreation|useDebounceEffect|useUpdateEffect|useUpdateLayoutEffect)'
    }]
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
        paths: ['./src']
      }
    },
    react: {
      version: 'detect'
    }
  }
};
