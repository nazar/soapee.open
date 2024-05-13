import Vote from 'models/vote';

export default function(incomingOptions) {
  const options = Object.assign({
    voteableTable: null
  }, incomingOptions);

  if (!(options.voteableTable)) {
    throw Error('voteableTable is required');
  }

  return (Model) => {
    return class extends Model {
      static get relationMappings() {
        return {
          ...(Model.relationMappings || {}),

          votes: {
            relation: Model.HasManyRelation,
            modelClass: Vote,
            filter: { voteableType: options.voteableTable },
            beforeInsert(model) {
              model.voteableType = options.voteableTable;
            },
            join: {
              from: `${options.voteableTable}.id`,
              to: 'votes.voteableId'
            }
          }
        };
      }
    };
  };
}
