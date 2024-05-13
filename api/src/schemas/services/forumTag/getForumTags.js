import _ from 'lodash';

import ForumTag from 'models/forumTag';

export default function getForumTags({ search }) {
  return _.tap(ForumTag.query(), (query) => {
    query.where({ forumId: search.forumId });
  });
}
