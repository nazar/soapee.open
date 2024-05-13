import _ from 'lodash';
import Bluebird from 'bluebird';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';

import client from 'client';
import noop from 'services/noop';
import LoginSignup from 'components/shared/Modals/LoginSignup';
import { analyticsEvent } from 'components/shared/GAEventReporter';

import voteOnVoteableMutation from './voteOnVoteable.gql';
import './voteable.styl';


export default function Voteable({ voteable, voteableType, onVoted }) {
  const [saving, setSaving] = useState(false);

  return (voteable && (
    <div className="voteable">
      <UpVote voteable={voteable} voteableType={voteableType} saving={saving} onVote={handleVote} />
      <Score voteable={voteable} />
    </div>
  )) || null;

  //

  function handleVote(vote) {
    setSaving(true);

    return Bluebird.resolve(client.mutate({
      mutation: voteOnVoteableMutation,
      variables: {
        input: {
          voteableId: voteable.id,
          voteableType,
          vote
        }
      }
    }))
      .then(({ data: { voteOnVoteable } }) => onVoted(voteOnVoteable))
      .then(() => setSaving(false))
      .tapCatch(() => setSaving(false));
  }
}

Voteable.defaultProps = {
  onVoted: noop
};

Voteable.propTypes = {
  voteable: PropTypes.object.isRequired,
  voteableType: PropTypes.string.isRequired,
  onVoted: PropTypes.func
};

function UpVote({ voteable, voteableType, saving, onVote }) {
  const color = _.get(voteable, 'myVote.vote') === 1 ? { color: 'orange' } : {};

  return (
    <div className="up-vote">
      <LoginSignup>
        <Icon
          link
          fitted
          size="big"
          name="caret up"
          disabled={saving}
          {...color}
          data-cy="up-vote"
          onClick={handleVote}
        />
      </LoginSignup>
    </div>
  );

  function handleVote() {
    analyticsEvent({ category: 'Votes', action: 'upvote', label: voteableType, value: Number(voteable.id) });
    return onVote(1);
  }
}

UpVote.defaultProps = {
  saving: false
};

UpVote.propTypes = {
  voteable: PropTypes.object.isRequired,
  voteableType: PropTypes.string.isRequired,
  saving: PropTypes.bool,
  onVote: PropTypes.func.isRequired
};

function Score({ voteable }) {
  const score = _.get(voteable, 'stats.votes.score', 0);

  return <div className="score">{score}</div>;
}

Score.propTypes = {
  voteable: PropTypes.object.isRequired
};
