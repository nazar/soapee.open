import Notification from 'models/notification';

export default function newCopiedRecipe({ sourceUser, targetUserId, newRecipe, fromRecipeId, trx }) {
  if (targetUserId !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: newRecipe.id,
        notifiableType: 'recipes',
        sourceUserId: sourceUser.id,
        targetUserId,
        notificationMeta: {
          type: 'copiedRecipe',
          v: 1,
          fromRecipeId
        }
      })
      .returning('*');
  }
}
