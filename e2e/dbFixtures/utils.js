const _ = require('lodash');

module.exports.importSanitizer = function(fixture, whitelist) {
  return _.reduce(fixture, (result, rows, tableName) => {
    return _.tap(result, (r) => {
      r[tableName] = _.map(rows, (row) => {
        return _.chain(row)
          .toPairs()
          .reduce((result2, [columnName, columnValue]) => {
            const transformedValue = _.isString(columnValue) && _.indexOf(whitelist, columnName) === -1
              ? columnValue.replace(/:/g, '::')
              : columnValue;

            return _.tap(result2, (res) => {
              res[columnName] = transformedValue;
            });
          }, {})
          .value();
      });
    });
  }, {});
};
