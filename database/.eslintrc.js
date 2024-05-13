module.exports = {
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "new-cap": [2, {"capIsNewExceptions": ["STRING", "INT", "DECIMAL"]}],

    // airbnb defines these as errors - Ignore for Migrations files
    "no-unused-vars": [0],
    "no-use-before-define": [0],

    // actually, we need console here
    "no-console": [0]
  }
};
