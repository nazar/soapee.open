module.exports = (Model) => {
  const columnName = 'deletedAt';

  class SDQueryBuilder extends Model.QueryBuilder {
    delete() {
      this.mergeContext({
        softDelete: true
      });

      const patch = {};

      patch[columnName] = new Date();
      return this.patch(patch);
    }

    // provide a way to actually delete the row if necessary
    hardDelete() {
      return super.delete();
    }

    // provide a way to undo the delete
    undelete() {
      this.mergeContext({
        undelete: true
      });

      const patch = {};

      patch[columnName] = null;

      return this.patch(patch);
    }

    // provide a way to filter to ONLY deleted records without having to remember the column name
    whereDeleted() {
      // qualify the column name
      return this.whereNotNull(`${this.modelClass().tableName}.${columnName}`);
    }

    // provide a way to filter out deleted records without having to remember the column name
    whereNotDeleted() {
      // qualify the column name
      return this.whereNull(`${this.modelClass().tableName}.${columnName}`);
    }
  }

  return class extends Model {
    static get QueryBuilder() {
      return SDQueryBuilder;
    }

    // add a named filter for use in the .eager() function
    static get namedFilters() {
      // patch the notDeleted filter into the list of namedFilters
      return Object.assign({}, super.namedFilters, {
        notDeleted: (b) => {
          b.whereNotDeleted();
        },
        deleted: (b) => {
          b.whereDeleted();
        }
      });
    }
  };
};
