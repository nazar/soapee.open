import Notification from 'models/notification';
import summariser from 'services/summariser';

import getUserNotifications from './getUserNotifications';

export default function getUserNotificationsSummary({ search, user }) {
  const query = getUserNotifications({ search, user });

  return summariser(Notification, query);
}
