import { compose, Model } from 'objection';

import actsAsParanoid from 'models/plugins/actsAsParanoid';
import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  actsAsParanoid,
  setUpdatedAt
);

export default class Additive extends mixins(Model) {
  static tableName = 'additives';
}
