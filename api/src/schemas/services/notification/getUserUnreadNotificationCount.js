import Notification from 'models/notification';

export default function getUserUnreadNotificationCount({ user }) {
  return Notification
    .query()
    .count('id as counts')
    .where({ targetUserId: user.id, read: false })
    .first()
    .then(({ counts }) => counts);
}
