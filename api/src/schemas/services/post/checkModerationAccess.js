import _ from 'lodash';
import Bluebird from 'bluebird';

import { ForbiddenError } from 'services/errors';
import ForumModerator from 'models/forumModerator';

export default function updatePostableStats({ post, user, trx }) {
  let postable;
  let userIsForumModerator;

  return populateAccessCheckVariables()
    .then(checkIfCanModerate);

  // implementation

  function populateAccessCheckVariables() {
    return Bluebird
      .try(() => {
        if (post.postableType === 'forums') {
          return ForumModerator
            .query(trx)
            .findOne({
              forumId: post.postableId,
              userId: user.id
            })
            .then(res => (userIsForumModerator = !(_.isEmpty(res))));
        }
      })
      .then(() => post
        .getPostable({ trx })
        .then(res => (postable = res))
      );
  }

  function checkIfCanModerate() {
    // need to determine the post's postableType as different rules will apply:
    if (post.postableType === 'oils') {
      if (!(user.isAdmin)) {
        throw new ForbiddenError();
      }
    } else if (post.postableType === 'forums') {
      // postableType: forums
      // determine if the user is the post.postableId owner, forum moderator or admin
      const canDelete = (user.id === postable.userId) || userIsForumModerator || user.isAdmin;

      if (!canDelete) {
        throw new ForbiddenError('Insufficient permissions for this operation');
      }
    }
  }
}
