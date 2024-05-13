import _ from 'lodash';
import React from 'react';
import { Button, Feed, Header, Message, Segment } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';
import { markAllNotificationsRead } from 'services/notification';

import Notification from 'components/shared/Notification';
import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';

import userNotificationsQuery from './queries/userNotifications.gql';
import userNotificationsSummaryQuery from './queries/userNotificationsSummary.gql';

export default function NotificationsUnread() {
  const itemsQuery = {
    query: userNotificationsQuery,
    dataKey: 'userNotifications',
    variables: {
      search: { readStatus: 'unread' }
    }
  };

  const summaryQuery = {
    query: userNotificationsSummaryQuery,
    dataKey: 'userNotificationsSummary',
    variables: {
      search: { readStatus: 'unread' }
    }
  };

  const { paginatorProps, items: notifications, loading, refetch } = usePaginator({
    summaryQuery, itemsQuery, perPage: 20
  });

  const noUnreadNotifications = _.isEmpty(notifications) && !(loading);

  return (
    <Section loading={loading} className="notifications-unread-component" data-cy="notifications-unread">
      <Header as="h2">My Unread Notifications</Header>

      {noUnreadNotifications && <NoUnreadNotifications />}

      {!(noUnreadNotifications) && (
        <Segment>
          <Segment.Inline>
            <Button onClick={handleAllRead} data-cy="mark-notifications-read">
              Mark all notifications as read
            </Button>
          </Segment.Inline>
        </Segment>
      )}

      {!(noUnreadNotifications) && (
        <Segment>
          <Feed data-cy="notifications-unread">
            {_.map(notifications, (notification) => (
              <Notification
                key={notification.id}
                notification={notification}
              />
            ))}
          </Feed>
        </Segment>
      )}

      <UberPaginator {...paginatorProps} />
    </Section>
  );

  function handleAllRead() {
    return markAllNotificationsRead()
      .then(() => refetch());
  }
}

function NoUnreadNotifications() {
  return (
    <Message
      icon="mail"
      header="No Unread Notifications"
      content="You're all caught up on your notifications!"
    />
  );
}
