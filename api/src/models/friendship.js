import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';

const mixins = compose(setCreatedAt);

export default class Friendship extends mixins(Model) {
  static tableName = 'friendships';
}
