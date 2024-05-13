import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';
import setCreatedAt from 'models/plugins/setCreatedAt';

const mixins = compose(
  setCreatedAt,
  setUpdatedAt
);

export default class Verification extends mixins(Model) {
  static tableName = 'verifications';

  static get relationMappings() {
    // eslint-disable-next-line global-require
    const User = require('models/user').default;

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'verifications.userId',
          to: 'users.id'
        }
      }
    };
  }
}
