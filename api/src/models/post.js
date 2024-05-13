import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';
import actsAsCommentable from 'models/plugins/actsAsCommentable';
import actsAsFavouriteable from 'models/plugins/actsAsFavouriteable';
import actsAsVoteable from 'models/plugins/actsAsVoteable';
import actsAsReportable from 'models/plugins/actsAsReportable';
import actsAsParanoid from 'models/plugins/actsAsParanoid';

import getPostable from 'schemas/services/post/getPostable';

const mixins = compose(
  setUpdatedAt,
  actsAsParanoid,
  actsAsCommentable({
    commentableTable: 'posts'
  }),
  actsAsFavouriteable({
    favouriteableTable: 'posts'
  }),
  actsAsVoteable({
    voteableTable: 'posts'
  }),
  actsAsReportable({
    reportableTable: 'posts'
  })
);

export default class Post extends mixins(Model) {
  static tableName = 'posts';

  getPostable({ trx } = {}) {
    return getPostable({
      postableId: this.postableId,
      postableType: this.postableType,
      trx
    });
  }
}
