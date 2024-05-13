import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';

const mixins = compose(
  setCreatedAt
);

export default class ForumUserSubscription extends mixins(Model) {
  static tableName = 'forums_users_subscriptions';
}
