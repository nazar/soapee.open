import _ from 'lodash';

export function userIsForumAdmin(currentUser, forum) {
  const currentUserId = _.get(currentUser, 'id');
  const isForumOwner = currentUserId === _.get(forum, 'userId');
  const moderatorIds = _.chain(forum).get('moderators').map('userId').value();

  return isForumOwner || _.includes(moderatorIds, currentUserId);
}

export function userCanPost(currentUser, forum) {
  const forumType = _.get(forum, 'forumType');
  const forumOwnerId = _.get(forum, 'userId');
  const currentUserId = _.get(currentUser, 'id');

  // only the owner or moderators can post if the forum is restricted
  if (forumType === 'restricted') {
    const isOwner = forumOwnerId && (forumOwnerId === currentUserId);
    const isForumAdmin = userIsForumAdmin(currentUser, forum);

    return isOwner || isForumAdmin;
  } else {
    return true;
  }
}
