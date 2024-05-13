import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setUpdatedAt
);

export default class Feed extends mixins(Model) {
  static tableName = 'feeds';
}
