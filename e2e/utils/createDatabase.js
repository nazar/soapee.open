const process = require('process');

const database = require('./database');

database.createDatabase()
  .then(
    () => {
      console.log(database.databaseUri);
      process.exit(0);
    },
    (e) => {
      console.log('e', e);
      process.exit(1);
    });
