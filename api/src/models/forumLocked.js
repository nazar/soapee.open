import { compose, Model } from 'objection';

import actsAsParanoid from 'models/plugins/actsAsParanoid';
import setCreatedAt from 'models/plugins/setCreatedAt';
import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  actsAsParanoid,
  setCreatedAt,
  setUpdatedAt
);

export default class ForumLocked extends mixins(Model) {
  static tableName = 'forums_locked';
}
