import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setUpdatedAt
);

export default class Notification extends mixins(Model) {
  static tableName = 'notifications';

  static get jsonAttributes() {
    return ['notificationMeta'];
  }
}
