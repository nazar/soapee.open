import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button } from 'semantic-ui-react';

import client from 'client';

import toggleForumSubscribeMutation from './forumUserSubscriptionToggleCurrentUser.gql';

export default function Subscribe({ forum, onSubscribed }) {
  const [saving, setSaving] = useState(false);
  const isSubscribed = _.has(forum, 'mySubscription.id');
  const caption = isSubscribed ? 'Subscribed' : 'Subscribe';

  return (
    <Button
      active={isSubscribed}
      size="mini"
      loading={saving}
      onClick={subscribe}
      data-cy="subscribe-button"
    >
      {caption}
    </Button>
  );

  //

  function subscribe() {
    setSaving(true);

    return Bluebird.resolve(client
      .mutate({
        mutation: toggleForumSubscribeMutation,
        variables: {
          forumId: forum.id
        }
      }))
      .then(({ data: { forumUserSubscriptionToggleCurrentUser } }) => forumUserSubscriptionToggleCurrentUser)
      .then((forumUserSubscriptionToggleCurrentUser) => {
        setSaving(false);
        onSubscribed(forumUserSubscriptionToggleCurrentUser);
      })
      .tapCatch(() => setSaving(false));
  }
}

Subscribe.propTypes = {
  forum: PropTypes.object.isRequired,
  onSubscribed: PropTypes.func.isRequired
};
