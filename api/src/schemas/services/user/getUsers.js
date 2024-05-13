import _ from 'lodash';

import User from 'models/user';

export default function getUsers({ currentUser, search, page }) {
  return _.tap(User.query(), (query) => {
    const friendType = _.get(search, 'friendType');

    const friendFilter = {
      approved: myApprovedFriends,
      pendingIncoming: myIncomingFriendRequests,
      pendingOutgoing: myOutgoingFriendRequests
    }[friendType];

    if (friendFilter) {
      friendFilter(query, currentUser.id);
    }

    const limit = _.get(page, 'limit') || 20;
    const offset = _.get(page, 'offset');

    if (limit && limit > 100) {
      throw new Error('Invalid request');
    }

    limit && query.limit(limit);
    offset && query.offset(offset);
  });
}

function myApprovedFriends(query, currentUserId) {
  query
    .join('friendships', {
      'friendships.friendId': 'users.id'
    })
    .where('friendships.userId', '=', currentUserId)
    // eslint-disable-next-line max-len
    .whereRaw('exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )');
}

function myIncomingFriendRequests(query, currentUserId) {
  query
    .join('friendships', {
      'friendships.userId': 'users.id'
    })
    .where('friendships.friendId', '=', currentUserId)
    // eslint-disable-next-line max-len
    .whereRaw('not exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )');
}

function myOutgoingFriendRequests(query, currentUserId) {
  query
    .join('friendships', {
      'friendships.userId': 'users.id'
    })
    .where('friendships.friendId', '=', currentUserId)
    // eslint-disable-next-line max-len
    .whereRaw('not exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )');
}
