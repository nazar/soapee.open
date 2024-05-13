import _ from 'lodash';
import Bluebird from 'bluebird';

import ForumTag from 'models/forumTag';

export default function updateForumTags({ forumTags, trx }) {
  if (!(_.isEmpty(forumTags))) {
    return Bluebird
      .mapSeries(forumTags, ({ tag, color, id }) => {
        return ForumTag
          .query(trx)
          .patch(({ tag, color }))
          .where({ id })
          .returning('*');
      });
  }
}
