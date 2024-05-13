import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';
import setUpdatedAt from 'models/plugins/setUpdatedAt';
import actsAsFavouriteable from 'models/plugins/actsAsFavouriteable';
import actsAsVoteable from 'models/plugins/actsAsVoteable';
import actsAsReportable from 'models/plugins/actsAsReportable';
import actsAsParanoid from 'models/plugins/actsAsParanoid';

const mixins = compose(
  setCreatedAt,
  actsAsParanoid,
  setUpdatedAt,
  actsAsVoteable({
    voteableTable: 'comments'
  }),
  actsAsFavouriteable({
    favouriteableTable: 'comments'
  }),
  actsAsReportable({
    reportableTable: 'comments'
  })
);

export default class Comment extends mixins(Model) {
  static tableName = 'comments';
}
