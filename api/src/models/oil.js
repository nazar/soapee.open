import { compose, Model } from 'objection';

import actsAsCommentable from 'models/plugins/actsAsCommentable';
import actsAsFavouriteable from 'models/plugins/actsAsFavouriteable';
import actsAsPostable from 'models/plugins/actsAsPostable';
import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setUpdatedAt,
  actsAsCommentable({
    commentableTable: 'oils'
  }),
  actsAsFavouriteable({
    favouriteableTable: 'oils'
  }),
  actsAsPostable({
    postableTable: 'oils'
  })
);

export default class Oil extends mixins(Model) {
  static tableName = 'oils';
}
