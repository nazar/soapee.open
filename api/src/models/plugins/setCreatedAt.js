import Bluebird from 'bluebird';

export default (Model) => {
  return class extends Model {
    $beforeInsert(opt, context) {
      const maybePromise = super.$beforeUpdate(opt, context);

      return Bluebird
        .resolve(maybePromise)
        .then(() => {
          const date = new Date().toISOString();

          this.createdAt = date;
          this.updatedAt = date;
        });
    }
  };
};
