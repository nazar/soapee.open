import Notification from 'models/notification';

export default function newFavourite({ favourite, favouriteable, sourceUser, targetUser, trx }) {
  // favourite can be on a recipe, comment or post
  if (targetUser.id !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: favourite.id,
        notifiableType: 'favourites',
        sourceUserId: sourceUser.id,
        targetUserId: targetUser.id,
        notificationMeta: {
          type: 'favourite',
          v: 1,
          favouriteTarget: getFavouriteTarget({ favourite, favouriteable })
        }
      })
      .returning('*');
  }
}

function getFavouriteTarget({ favourite, favouriteable }) {
  if (favourite.favouriteableType === 'comments') {
    if (favouriteable.commentableType === 'recipes') {
      return {
        parentAction: 'comment',
        targetType: 'recipes',
        targetId: favouriteable.commentableId
      };
    } else if (favouriteable.commentableType === 'posts') {
      return {
        parentAction: 'comment',
        targetType: 'posts',
        targetId: favouriteable.commentableId
      };
    } else {
      throw new Error(`${favouriteable.commentableType} is not a recognised a recognised commentable type`);
    }
  } else if (favourite.favouriteableType === 'recipes') {
    return {
      targetType: 'recipes',
      targetId: favourite.favouriteableId
    };
  } else if (favourite.favouriteableType === 'posts') {
    return {
      targetType: 'posts',
      targetId: favourite.favouriteableId
    };
  }
}
