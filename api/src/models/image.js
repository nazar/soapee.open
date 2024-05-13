import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';
import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setCreatedAt,
  setUpdatedAt
);

export default class Image extends mixins(Model) {
  static tableName = 'images';
}
