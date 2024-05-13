import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCreation } from 'ahooks';
import { Emoji, Picker } from 'emoji-mart';
import { Button, Label, Icon, Popup } from 'semantic-ui-react';
import cx from 'clsx';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';
import Group from 'components/shared/Group';

import toggleReactionMutations from './toggleReaction.gql';
import './reactions.styl';


export default function Reactions({ className, reactions, reactionableId, reactionableType, onReaction }) {
  const currentUser = useCurrentUser();
  const sortedReactions = useReactionSummary({ currentUser, reactions });
  const labelProps = currentUser ? { as: 'a' } : {};
  const showReactionSection = !(_.isEmpty(currentUser)) || !(_.isEmpty(reactions));

  return showReactionSection && (
    <Group className={cx('reactions', className)} gap="0" data-cy="reactions">
      {_.map(sortedReactions, reaction => (
        <Popup
          inverted
          key={reaction.reaction}
          size="mini"
          disabled={_.isEmpty(reaction.userNameList)}
          trigger={(
            <Label
              basic
              key={reaction.reaction}
              className={cx('reaction-emoji', { mine: reaction.mine })}
              {...labelProps}
              data-cy="reaction-emoji"
              onClick={handleReaction(reaction)}
            >
              <Emoji
                tooltip
                emoji={reaction.reaction}
                size={16}
              />

              <span className="counter">
                {reaction.count}
              </span>
            </Label>
          )}
        >
          {reaction.userNameList}
        </Popup>
      ))}

      {currentUser && <AddReaction onAddEmoji={toggleReaction} />}
    </Group>
  );

  // private handlers

  function handleReaction({ reaction }) {
    return () => {
      if (currentUser) {
        return toggleReaction(reaction);
      }
    };
  }

  function toggleReaction(reaction) {
    return client
      .mutate({
        mutation: toggleReactionMutations,
        variables: {
          input: {
            reactionableId,
            reactionableType,
            reaction
          }
        }
      })
      .then(onReaction);
  }
}

Reactions.defaultProps = {
  className: null,
  reactions: null
};

Reactions.propTypes = {
  className: PropTypes.string,
  reactions: PropTypes.array,
  reactionableId: PropTypes.string.isRequired,
  reactionableType: PropTypes.oneOf(['comments', 'posts', 'recipes']).isRequired,
  onReaction: PropTypes.func.isRequired
};

function useReactionSummary({ currentUser, reactions }) {
  return useCreation(() => {
    const myUserId = _.get(currentUser, 'id');

    return _.chain(reactions)
      .groupBy('reaction')
      .map((group, reaction) => ({
        reaction,
        count: group.length,
        mine: _.some(group, { userId: String(myUserId) }),
        userNameList: _.chain(group).map('user.name').join(', ').value()
      }))
      .orderBy('count', 'desc')
      .value();
  }, [currentUser, reactions]);
}

function AddReaction({ onAddEmoji }) {
  const [open, setOpen] = useState(false);

  return (
    <Popup
      on="click"
      open={open}
      onOpen={openIt}
      onClose={closeIt}
      data-cy="reaction-emoji-picker"
      trigger={(
        <Button icon size="mini" data-cy="add-reaction">
          <Icon.Group>
            <Icon name="smile outline" />
            <Icon corner name="add" />
          </Icon.Group>
        </Button>
      )}
    >
      <Picker showSkinTones={false} showPreview={false} onSelect={setEmoji} />
    </Popup>
  );

  //

  function setEmoji(emoji) {
    onAddEmoji(emoji.id);
    closeIt();
  }

  function openIt() {
    setOpen(true);
  }

  function closeIt() {
    setOpen(false);
  }
}

AddReaction.propTypes = {
  onAddEmoji: PropTypes.func.isRequired
};
