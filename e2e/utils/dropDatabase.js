const process = require('process');

const database = require('./database');

database.dropDatabase()
  .then(
    () => {
      console.log('Drop e2e database:', database.databaseUri);
      process.exit(0);
    },
    (e) => {
      console.log('e', e);
      process.exit(1);
    });
