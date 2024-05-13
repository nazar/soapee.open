import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setUpdatedAt
);

export default class Favourite extends mixins(Model) {
  static tableName = 'favourites';
}