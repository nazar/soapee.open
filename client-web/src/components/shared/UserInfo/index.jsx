import React from 'react';
import PropTypes from 'prop-types';
import { Popup, Label, Icon, Placeholder } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Avatar from 'components/shared/Avatar';
import TimeAgo from 'components/shared/TimeAgo';

import { getUserKarma, getUserCountStats } from 'services/user';

import userQuery from './user.gql';

import './userInfo.styl';

export default function UserInfo({ user }) {
  return (
    <span className="user-info">
      <Popup trigger={<UserNameAndProfileLink user={user} />} className="user-info-popup">
        <Popup.Content>
          <UserDetails user={user} />
        </Popup.Content>
      </Popup>
    </span>
  );
}

UserInfo.propTypes = {
  user: PropTypes.object.isRequired
};

function UserNameAndProfileLink({ user, ...props }) {
  return (
    <Link to={`/profiles/${user.id}`} className="user-name" {...props}>{user.name}</Link>
  );
}

UserNameAndProfileLink.propTypes = {
  user: PropTypes.object.isRequired
};

function UserDetails({ user }) {
  const { data: { user: userDetails } = {}, loading } = useQuery(userQuery, {
    variables: { id: user.id }
  });

  if (loading) {
    return (
      <Placeholder>
        <Placeholder.Header image>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Header>

        <Placeholder.Paragraph>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Paragraph>
      </Placeholder>
    );
  } else {
    const karma = getUserKarma(userDetails);
    const { comments, posts, recipes } = getUserCountStats(userDetails);

    return (
      <div className="user-details">
        <div className="info-container">
          <Avatar user={userDetails} />

          <div className="info-details">
            <div className="user-name">{userDetails.name}</div>

            {userDetails.createdAt && (
              <div className="joined">
                Joined <TimeAgo plain date={userDetails.createdAt} />
              </div>
            )}
          </div>
        </div>

        <div className="stats-container">
          <Label color="blue" ribbon>Karma: {karma}</Label>
        </div>

        <div className="stats-container">
          <Label><Icon name="comment" />{ comments }</Label>
          <Label><Icon name="wordpress forms" />{ posts }</Label>
          <Label><Icon name="book" />{ recipes }</Label>
        </div>
      </div>
    );
  }
}
