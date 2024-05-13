import React from 'react';
import { NavLink, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Container, Label, Grid, Menu } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';

import useAuthenticated from 'hooks/useAuthenticated';
import Group from 'components/shared/Group';
import Section from 'components/shared/Section';

import userNotificationUnreadCountQuery from 'queries/notification/userNotificationUnreadCount.gql';

import Additives from './Additives';
import Comments from './Comments';
import Favourites from './Favourites';
import Friends from './Friends';
import FriendsPending from './FriendsPending';
import FriendsRecipes from './FriendsRecipes';
import Forums from './Forums';
import NotificationsAll from './NotificationsAll';
import NotificationsUnread from './NotificationsUnread';
import Posts from './Posts';
import Profile from './Profile';
import Recipes from './Recipes';
import SubscribedForums from './SubscribedForums';

export default function Settings() {
  const { path } = useRouteMatch();
  const authenticated = useAuthenticated();

  const { data: { userNotificationUnreadCount } = {} } = useQuery(userNotificationUnreadCountQuery, {
    skip: !(authenticated)
  });

  if (authenticated) {
    return (
      <Container className="settings">
        <Grid stackable>
          <Grid.Column width={3}>
            <Menu fluid vertical stackable>
              <Menu.Item>
                <Menu.Header>My</Menu.Header>
                <Menu.Menu>
                  <Menu.Item name="Profile" as={NavLink} to={`${path}`} exact strict />
                  <Menu.Item name="Recipes" as={NavLink} to={`${path}/recipes`} />
                  <Menu.Item name="Additives" as={NavLink} to={`${path}/additives`} />
                  <Menu.Item name="Posts" as={NavLink} to={`${path}/posts`} />
                  <Menu.Item name="Comments" as={NavLink} to={`${path}/comments`} />
                  <Menu.Item name="Forums" as={NavLink} to={`${path}/forums`} />
                  <Menu.Item name="Subscribed Forums" as={NavLink} to={`${path}/subscribed-forums`} />
                </Menu.Menu>
              </Menu.Item>

              <Menu.Item>
                <Menu.Header>My Favourite</Menu.Header>
                <Menu.Menu>
                  <Menu.Item name="Recipes" as={NavLink} to={`${path}/favourites/recipes`} />
                  <Menu.Item name="Posts" as={NavLink} to={`${path}/favourites/posts`} />
                  <Menu.Item name="Comments" as={NavLink} to={`${path}/favourites/comments`} />
                </Menu.Menu>
              </Menu.Item>

              <Menu.Item>
                <Menu.Header>My Friends</Menu.Header>
                <Menu.Menu>
                  <Menu.Item name="Recipes" as={NavLink} to={`${path}/friends-recipes`} />
                  <Menu.Item name="Approved" as={NavLink} to={`${path}/friends`} />
                  <Menu.Item name="Pending" as={NavLink} to={`${path}/friends-pending`} />
                </Menu.Menu>
              </Menu.Item>

              <Menu.Item>
                <Menu.Header>My Notifications</Menu.Header>
                <Menu.Menu>
                  <Menu.Item as={NavLink} to={`${path}/notifications-unread`}>
                    <Group align="center" gap="1" data-cy="settings-notification-count">
                      <span>Unread</span>
                      {userNotificationUnreadCount > 0 && (
                        <Label circular color="red" size="mini">{userNotificationUnreadCount}</Label>
                      )}
                    </Group>
                  </Menu.Item>
                  <Menu.Item name="All" as={NavLink} to={`${path}/notifications-all`} />
                </Menu.Menu>
              </Menu.Item>
            </Menu>
          </Grid.Column>

          <Grid.Column stretched width={13}>
            <Section>
              <Switch>
                <Route path={`${path}/additives`}><Additives /></Route>
                <Route path={`${path}/comments`}><Comments /></Route>
                <Route path={`${path}/favourites`}><Favourites /></Route>
                <Route path={`${path}/forums`}><Forums /></Route>
                <Route path={`${path}/friends`}><Friends /></Route>
                <Route path={`${path}/friends-pending`}><FriendsPending /></Route>
                <Route path={`${path}/friends-recipes`}><FriendsRecipes /></Route>
                <Route path={`${path}/posts`}><Posts /></Route>
                <Route path={`${path}/recipes`}><Recipes /></Route>
                <Route path={`${path}/subscribed-forums`}><SubscribedForums /></Route>
                <Route path={`${path}/notifications-unread`}><NotificationsUnread /></Route>
                <Route path={`${path}/notifications-all`}><NotificationsAll /></Route>
                <Route strict exact path={path}><Profile /></Route>
              </Switch>
            </Section>
          </Grid.Column>
        </Grid>
      </Container>
    );
  } else {
    return <Redirect to="/auth/login" />;
  }
}
