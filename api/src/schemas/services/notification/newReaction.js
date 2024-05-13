import Notification from 'models/notification';

export default function newReaction({ reaction, reactionable, targetUser, sourceUser, trx }) {
  // if reactionable is a comment then get the commentable type as well to link to that
  // i.e. comment on a recipe - get recipe to link to the recipe

  if (targetUser.id !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: reaction.id,
        notifiableType: 'reactions',
        sourceUserId: sourceUser.id,
        targetUserId: targetUser.id,
        notificationMeta: {
          type: 'reaction',
          v: 1,
          reaction: reaction.reaction,
          reactionTarget: getReactionTarget({ reaction, reactionable })
        }
      })
      .returning('*');
  }
}

function getReactionTarget({ reaction, reactionable }) {
  if (reaction.reactionableType === 'comments') {
    if (reactionable.commentableType === 'recipes') {
      return {
        parentAction: 'comment',
        targetType: 'recipes',
        targetId: reactionable.commentableId
      };
    } else if (reactionable.commentableType === 'posts') {
      return {
        parentAction: 'comment',
        targetType: 'posts',
        targetId: reactionable.commentableId
      };
    } else {
      throw new Error(`${reactionable.commentableType} is not a recognised a recognised commentable type`);
    }
  } else if (reaction.reactionableType === 'recipes') {
    return {
      targetType: 'recipes',
      targetId: reaction.reactionableId
    };
  } else if (reaction.reactionableType === 'posts') {
    return {
      targetType: 'posts',
      targetId: reaction.reactionableId
    };
  }
}
