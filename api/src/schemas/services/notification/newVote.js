import Notification from 'models/notification';

export default function newVote({ vote, voteable, targetUser, sourceUser, trx }) {
  // if voteable is a comment then get the commentable type as well to link to that
  // i.e. comment on a recipe - get recipe to link to the recipe

  if (targetUser.id !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: vote.id,
        notifiableType: 'votes',
        sourceUserId: sourceUser.id,
        targetUserId: targetUser.id,
        notificationMeta: {
          type: 'upvote',
          v: 1,
          voteTarget: getVoteTarget({ vote, voteable })
        }
      })
      .returning('*');
  }
}

function getVoteTarget({ vote, voteable }) {
  if (vote.voteableType === 'comments') {
    if (voteable.commentableType === 'recipes') {
      return {
        parentAction: 'comment',
        targetType: 'recipes',
        targetId: voteable.commentableId
      };
    } else if (voteable.commentableType === 'posts') {
      return {
        parentAction: 'comment',
        targetType: 'posts',
        targetId: voteable.commentableId
      };
    } else {
      throw new Error(`${voteable.commentableType} is not a recognised a recognised commentable type`);
    }
  } else if (vote.voteableType === 'recipes') {
    return {
      targetType: 'recipes',
      targetId: vote.voteableId
    };
  } else if (vote.voteableType === 'posts') {
    return {
      targetType: 'posts',
      targetId: vote.voteableId
    };
  }
}
