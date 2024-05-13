import Friendship from 'models/friendship';

export default async function userFriendStatus({ userId, user }) {
  const friendships = await Friendship
    .query()
    .where((qb) => {
      qb.orWhere({
        userId: user.id,
        friendId: userId
      });

      qb.orWhere({
        userId,
        friendId: user.id
      });
    });

  if (friendships.length === 2) {
    return 'friend';
  } else if (friendships.length === 1) {
    return 'pending';
  } else {
    return 'notFriend';
  }
}
