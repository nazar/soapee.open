import Notification from 'models/notification';

export default function newAwardedBestRecipe({ recipe, user, trx }) {
  return Notification
    .query(trx)
    .insert({
      notifiableId: recipe.id,
      notifiableType: 'recipes',
      sourceUserId: user.id,
      targetUserId: recipe.userId,
      notificationMeta: {
        type: 'bestRecipe',
        v: 1
      }
    })
    .returning('*');
}
