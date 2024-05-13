import _ from 'lodash';

import ForumTag from 'models/forumTag';

export default function createForumTags({ forum, forumTags, user, trx }) {
  if (!(_.isEmpty(forumTags))) {
    const insertPayload = _.map(forumTags, (tag) => ({
      forumId: forum.id,
      userId: user.id,
      tag: tag.tag,
      color: tag.color
    }));

    return ForumTag
      .query(trx)
      .insert(insertPayload)
      .returning('*');
  }
}
