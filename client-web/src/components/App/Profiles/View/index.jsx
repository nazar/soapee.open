import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Grid, Header, Segment, Menu } from 'semantic-ui-react';
import { NavLink, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';

import Section from 'components/shared/Section';
import UserCard from 'components/shared/UserCard';

import userQuery from '../queries/user.gql';

import Comments from './Comments';
import Forums from './Forums';
import Posts from './Posts';
import Recipes from './Recipes';

import userFriendStatusQuery from './queries/userFriendStatus.gql';
import makeFriendLinkMutation from './queries/makeFriendLink.gql';
import removeFriendLinkMutation from './queries/removeFriendLink.gql';

import './style.styl';

export default function View() {
  const { profileId } = useParams();

  return (
    <Container className="view-profile view-page">
      <UserInformationRow profileId={profileId} />
      <ProfileTabs />
    </Container>
  );
}

function UserInformationRow({ profileId }) {
  const { loading, data: { user } = {} } = useQuery(userQuery, {
    variables: { id: profileId }
  });

  const currentUser = useCurrentUser();

  return (
    <Section loading={loading}>
      {user && <UserInformation viewingUser={user} currentUser={currentUser} />}
    </Section>
  );
}

UserInformationRow.propTypes = {
  profileId: PropTypes.string.isRequired
};

function UserInformation({ viewingUser, currentUser }) {
  return (
    <Grid stackable columns="equal">
      <Grid.Row stretched>
        <Grid.Column>
          <UserCard centered user={viewingUser} />
        </Grid.Column>

        <Grid.Column width={12}>
          <Segment className="about-container">
            <About user={viewingUser} />
            {currentUser && (currentUser?.id !== viewingUser?.id) && (
              <ProfileActions
                viewingUser={viewingUser}
              />
            )}
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

UserInformation.propTypes = {
  viewingUser: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired
};

function About({ user }) {
  return (
    <div className="about">
      { user.about
        ? <div dangerouslySetInnerHTML={{ __html: user.about }} />
        : <Header>I haven&apos;t filled out my "about me" yet.</Header>
      }
    </div>
  );
}

About.propTypes = {
  user: PropTypes.object.isRequired
};

function ProfileActions({ viewingUser }) {
  const [saving, setSaving] = useState();

  const { data: { userFriendStatus } = {}, refetch } = useQuery(userFriendStatusQuery, {
    variables: { userId: viewingUser.id }
  });

  return (
    <Segment basic textAlign="right" className="profile-actions" data-cy="profile-actions">
      {userFriendStatus === 'notFriend' && (
        <Button
          loading={saving}
          data-cy="friend-request"
          onClick={handleMakeFriend}
        >
          Friend Request
        </Button>
      )}

      {userFriendStatus === 'pending' && (
        <Button
          negative
          data-cy="cancel-request"
          onClick={handleUnfriend}
        >
          Cancel Friend Request
        </Button>
      )}

      {userFriendStatus === 'friend' && (
        <Button
          negative
          data-cy="unfriend"
          onClick={handleUnfriend}
        >
          Unfriend
        </Button>
      )}
    </Segment>
  );

  //

  function handleMakeFriend() {
    setSaving(true);

    return client
      .mutate({
        mutation: makeFriendLinkMutation,
        variables: { toUserId: viewingUser.id }
      })
      .then(() => {
        setSaving();
        return refetch();
      });
  }

  function handleUnfriend() {
    setSaving(true);

    return client
      .mutate({
        mutation: removeFriendLinkMutation,
        variables: { toUserId: viewingUser.id }
      })
      .then(() => {
        setSaving();
        return refetch();
      });
  }
}

ProfileActions.propTypes = {
  viewingUser: PropTypes.object.isRequired
};

function ProfileTabs() {
  const { url, path } = useRouteMatch();

  return (
    <>
      <Menu pointing stackable>
        <Menu.Item
          name="Public Recipes"
          as={NavLink}
          to={`${url}`}
          exact
        />

        <Menu.Item name="Posts" as={NavLink} to={`${url}/posts`} />
        <Menu.Item name="Comments" as={NavLink} to={`${url}/comments`} />
        <Menu.Item name="Forums" as={NavLink} to={`${url}/forums`} />
      </Menu>

      <Switch>
        <Route path={`${path}/comments`} component={Comments} />
        <Route path={`${path}/forums`} component={Forums} />
        <Route path={`${path}/posts`} component={Posts} />
        <Route exact path={path} component={Recipes} />
      </Switch>
    </>
  );
}
