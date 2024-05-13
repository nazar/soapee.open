import Comment from 'models/comment';

export default function(incomingOptions) {
  const options = Object.assign({
    commentableTable: null
  }, incomingOptions);

  if (!(options.commentableTable)) {
    throw Error('commentableTable is required');
  }

  return (Model) => {
    return class extends Model {
      static get relationMappings() {
        return {
          ...(Model.relationMappings || {}),

          comments: {
            relation: Model.HasManyRelation,
            modelClass: Comment,
            filter: { commentableType: options.commentableTable },
            beforeInsert(model) {
              model.commentableType = options.commentableTable;
            },
            join: {
              from: `${options.commentableTable}.id`,
              to: 'comments.commentableId'
            }
          }
        };
      }
    };
  };
}
