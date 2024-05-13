import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Feed, Icon, Label, Loader, Popup, Message } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';
import { useUpdateEffect } from 'ahooks';
import { useLocation, Link } from 'react-router-dom';

import { markAllNotificationsRead } from 'services/notification';
import Notification from 'components/shared/Notification';
import userNotificationUnreadCountQuery from 'queries/notification/userNotificationUnreadCount.gql';

import userNotificationsQuery from './queries/userNotifications.gql';
import './style.styl';

export default function Notifications() {
  const location = useLocation();
  const [disabled, setDisabled] = useState();

  const { data: { userNotificationUnreadCount } = {} } = useQuery(userNotificationUnreadCountQuery);

  // force hide the popup when navigating
  useUpdateEffect(() => {
    setDisabled(true);
    setTimeout(() => setDisabled());
  }, [location]);

  return (
    <Popup
      flowing
      basic
      wide="very"
      className="notifications-component"
      on="click"
      disabled={disabled}
      trigger={<NotificationTrigger userNotificationUnreadCount={userNotificationUnreadCount} />}
      onOpen={markNotificationsRead}
    >
      <Popup.Header>
        My latest notifications
      </Popup.Header>

      <Popup.Content>
        <UserNotifications />
      </Popup.Content>
    </Popup>
  );

  function markNotificationsRead() {
    if (userNotificationUnreadCount > 0) {
      return markAllNotificationsRead();
    }
  }
}

function NotificationTrigger({ userNotificationUnreadCount, ...rest }) {
  return (
    <div className="notification-trigger" data-cy="notification-trigger" {...rest}>
      <Icon circular inverted name="bell" />

      {userNotificationUnreadCount > 0 && (
        <Label circular className="notification-count" color="red" size="tiny" data-cy="notification-count">
          {userNotificationUnreadCount}
        </Label>
      )}
    </div>
  );
}

NotificationTrigger.defaultProps = {
  userNotificationUnreadCount: null
};

NotificationTrigger.propTypes = {
  userNotificationUnreadCount: PropTypes.number
};

function UserNotifications({ ...rest }) {
  const { loading, data: { userNotifications } = {} } = useQuery(userNotificationsQuery);

  return (
    <Feed className="user-notifications" data-cy="user-notifications" {...rest}>
      <Loader active={loading} size='mini' />

      {!(_.isEmpty(userNotifications)) && (
        <p className="intro">
          visit <Link to="/settings">settings</Link> to view all your{' '}
          <Link to="/settings/notifications-unread">unread</Link> and{' '}
          <Link to="/settings/notifications-all">all</Link> notifications.
        </p>
      )}

      {_.map(userNotifications, (notification) => (
        <Notification
          key={notification.id}
          notification={notification}
        />
      ))}

      {_.isEmpty(userNotifications) && !(loading) && (
        <Message>
          No notifications yet.
        </Message>
      )}
    </Feed>
  );
}
