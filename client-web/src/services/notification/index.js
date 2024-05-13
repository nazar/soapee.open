import client from 'client';
import userNotificationUnreadCountQuery from 'queries/notification/userNotificationUnreadCount.gql';

import markAllMyNotificationsAsReadMutation from './queries/markAllMyNotificationsAsRead.gql';

export function markAllNotificationsRead() {
  return client
    .mutate({
      mutation: markAllMyNotificationsAsReadMutation
    })
    // update the local cache for notification count components
    .then(() => getUnreadNotificationCount());
}

export function getUnreadNotificationCount() {
  return client.query({
    query: userNotificationUnreadCountQuery,
    fetchPolicy: 'network-only'
  });
}
