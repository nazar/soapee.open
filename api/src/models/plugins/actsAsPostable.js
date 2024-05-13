import Post from 'models/post';
import getPostable from 'schemas/services/post/getPostable';

export default function(incomingOptions) {
  const options = Object.assign({
    postableTable: null
  }, incomingOptions);

  if (!(options.postableTable)) {
    throw Error('postableTable is required');
  }

  return (Model) => {
    return class extends Model {
      static get relationMappings() {
        return {
          ...(Model.relationMappings || {}),

          posts: {
            relation: Model.HasManyRelation,
            modelClass: Post,
            filter: { postableType: options.postableTable },
            beforeInsert(model) {
              model.postableType = options.postableTable;
            },
            join: {
              from: `${options.postableTable}.id`,
              to: 'posts.postableId'
            }
          }
        };
      }

      getPostable({ trx }) {
        return getPostable({
          postableId: this.postableId,
          postableType: this.postableType,
          trx
        });
      }
    };
  };
}
