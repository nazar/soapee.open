import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';
import actsAsCommentable from 'models/plugins/actsAsCommentable';
import actsAsFavouriteable from 'models/plugins/actsAsFavouriteable';
import actsAsParanoid from 'models/plugins/actsAsParanoid';
import actsAsVoteable from 'models/plugins/actsAsVoteable';
import actsAsReportable from 'models/plugins/actsAsReportable';

const mixins = compose(
  setCreatedAt,
  actsAsParanoid,
  actsAsCommentable({
    commentableTable: 'recipes'
  }),
  actsAsFavouriteable({
    favouriteableTable: 'recipes'
  }),
  actsAsVoteable({
    voteableTable: 'recipes'
  }),
  actsAsReportable({
    reportableTable: 'recipes'
  })
);

export default class Recipe extends mixins(Model) {
  static tableName = 'recipes';
}
