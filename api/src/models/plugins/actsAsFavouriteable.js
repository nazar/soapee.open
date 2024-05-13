import Favourite from 'models/favourite';

export default function(incomingOptions) {
  const options = Object.assign({
    favouriteableTable: null
  }, incomingOptions);

  if (!(options.favouriteableTable)) {
    throw Error('favouriteableTable is required');
  }

  return (Model) => {
    return class extends Model {
      static get relationMappings() {
        return {
          ...(Model.relationMappings || {}),

          favourites: {
            relation: Model.HasManyRelation,
            modelClass: Favourite,
            filter: { favouriteableType: options.favouriteableTable },
            beforeInsert(model) {
              model.favouriteableTable = options.favouriteableTable;
            },
            join: {
              from: `${options.favouriteableTable}.id`,
              to: 'favourites.favouriteableId'
            }
          }
        };
      }
    };
  };
}
