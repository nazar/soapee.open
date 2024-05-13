import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Header, Message, Segment } from 'semantic-ui-react';

import client from 'client';
import usePaginator from 'hooks/usePaginator';

import Section from 'components/shared/Section';
import UberPaginator from 'components/shared/UberPaginator';
import UserCard from 'components/shared/UserCard';

import myIncomingPendingFriendsQuery from '../queries/myIncomingPendingFriends.gql';
import myIncomingPendingFriendsSummaryQuery from '../queries/myIncomingPendingFriendsSummary.gql';
import makeFriendLinkMutation from '../queries/makeFriendLink.gql';
import removeFriendLinkMutation from '../queries/removeFriendLink.gql';

export default function FriendsPending() {
  const itemsQuery = {
    query: myIncomingPendingFriendsQuery,
    dataKey: 'myIncomingPendingFriends',
    variables: {
      order: {
        field: 'name',
        direction: 'asc'
      }
    }
  };

  const summaryQuery = {
    query: myIncomingPendingFriendsSummaryQuery,
    dataKey: 'myIncomingPendingFriendsSummary'
  };

  const { paginatorProps, items: friends, loading, refetch } = usePaginator({
    summaryQuery, itemsQuery
  });

  const hasFriends = !(_.isEmpty(friends));

  /* eslint-disable max-len */

  return (
    <Section basic loading={loading} className="settings-friends-pending">
      <Header as="h2">Users requesting to be my friend</Header>

      <Message
        attached
        warning
        icon="warning circle"
        content="Once a friend request is Approved, that user will be able to see your Recipes that are marked visible to Friends."
      />

      <Segment attached>
        {!(loading) && (hasFriends) && (
          <Card.Group>
            { _.map(friends, friend => (
              <UserCard
                key={`friend-${friend.id}`}
                user={friend}
                extraContent={<FriendActions friend={friend} onAccept={handleAccept} onReject={handleReject} />}
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

  /* eslint-enable max-len */

  //

  function handleAccept(friend) {
    return client.mutate({
      mutation: makeFriendLinkMutation,
      variables: { toUserId: friend.id }
    })
      .then(() => refetch());
  }

  function handleReject(friend) {
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
      header="No friend requests yet"
      content="You haven't made any friend requests yet..."
    />
  );
}

function FriendActions({ friend, onAccept, onReject }) {
  return (
    <div className="ui two buttons">
      <Button basic color="green" data-cy="approve-request" onClick={handleAccepted}>
        Approve
      </Button>

      <Button basic color="red" data-cy="decline-request" onClick={handleReject}>
        Decline
      </Button>
    </div>
  );

  function handleAccepted() {
    return onAccept(friend);
  }

  function handleReject() {
    return onReject(friend);
  }
}

FriendActions.propTypes = {
  friend: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired
};
