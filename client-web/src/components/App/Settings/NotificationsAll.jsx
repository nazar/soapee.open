import _ from 'lodash';
import React from 'react';
import { Feed, Header, Message, Segment } from 'semantic-ui-react';

import usePaginator from 'hooks/usePaginator';

import Notification from 'components/shared/Notification';
import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';

import userNotificationsQuery from './queries/userNotifications.gql';
import userNotificationsSummaryQuery from './queries/userNotificationsSummary.gql';

export default function NotificationsAll() {
  const itemsQuery = {
    query: userNotificationsQuery,
    dataKey: 'userNotifications',
    variables: {
      search: { readStatus: 'any' }
    }
  };

  const summaryQuery = {
    query: userNotificationsSummaryQuery,
    dataKey: 'userNotificationsSummary'
  };

  const { paginatorProps, items: notifications, loading } = usePaginator({
    summaryQuery, itemsQuery, perPage: 20
  });

  const noUnreadNotifications = _.isEmpty(notifications) && !(loading);

  return (
    <Section loading={loading} className="notifications-all-component" data-cy="notifications-all">
      <Header as="h2">All My Notifications</Header>

      {noUnreadNotifications && <NoNotifications />}

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
}

function NoNotifications() {
  return (
    <Message
      icon="mail"
      header="No Notifications"
      content="No notifications yet"
    />
  );
}
