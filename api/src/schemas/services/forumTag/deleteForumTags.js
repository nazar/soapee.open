import _ from 'lodash';

import ForumTag from 'models/forumTag';

export default function deleteForumTags({ forum, forumTags, trx }) {
  return ForumTag
    .query(trx)
    .delete()
    .where({ forumId: forum.id })
    .whereNotIn('id', _.map(forumTags, 'id'));
}
