import Notification from 'models/notification';

export default function markAllMyNotificationsAsRead({ user }) {
  const readOn = new Date();

  return Notification
    .query()
    .update({
      read: true,
      readOn
    })
    .where({ targetUserId: user.id });
}
