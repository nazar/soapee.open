import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Message, Header, Segment } from 'semantic-ui-react';

import client from 'client';
import usePaginator from 'hooks/usePaginator';

import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';
import UserCard from 'components/shared/UserCard';

import myFriendsQuery from '../queries/myFriends.gql';
import myFriendsSummaryQuery from '../queries/myFriendsSummary.gql';
import removeFriendLinkMutation from '../queries/removeFriendLink.gql';

import './style.styl';

export default function Friends() {
  const itemsQuery = {
    query: myFriendsQuery,
    dataKey: 'myFriends',
    variables: {
      order: {
        field: 'name',
        direction: 'asc'
      }
    }
  };

  const summaryQuery = {
    query: myFriendsSummaryQuery,
    dataKey: 'myFriendsSummary'
  };

  const { paginatorProps, items: friends, loading, refetch } = usePaginator({
    summaryQuery, itemsQuery
  });

  const hasFriends = !(_.isEmpty(friends));

  return (
    <Section basic loading={loading} className="settings-friends">
      <Header as="h2">My confirmed friends</Header>

      <Message
        attached
        icon="info circle"
        content="Confirmed friends are able to view all your Recipes that are marked as visible to Friends."
      />

      <Segment attached>
        {!(loading) && (hasFriends) && (
          <Card.Group>
            { _.map(friends, friend => (
              <UserCard
                key={`friend-${friend.id}`}
                user={friend}
                extraContent={<UnfriendAction friend={friend} onUnfriend={handleUnfriend} />}
              />
            ))
            }
          </Card.Group>
        )}

        {!(loading) && !(hasFriends) && (
          <IHaventGotAnyFriendsYet />
        )}

        <UberPaginator {...paginatorProps} />
      </Segment>
    </Section>
  );

  //

  function handleUnfriend(friend) {
    return client.mutate({
      mutation: removeFriendLinkMutation,
      variables: { toUserId: friend.id }
    })
      .then(() => refetch());
  }
}

function IHaventGotAnyFriendsYet() {
  return (
    <Message
      className="no-friends-message"
      icon="user"
      header="No friends yet"
      content="Nobody has requested to be your friend yet..."
    />
  );
}

function UnfriendAction({ friend, onUnfriend }) {
  return (
    <Button basic color="red" onClick={handleUnfriend}>
      Unfriend
    </Button>
  );

  function handleUnfriend() {
    return onUnfriend(friend);
  }
}

UnfriendAction.propTypes = {
  friend: PropTypes.object.isRequired,
  onUnfriend: PropTypes.func.isRequired
};
