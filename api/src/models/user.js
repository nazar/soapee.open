import { compose, Model } from 'objection';

import setUpdatedAt from 'models/plugins/setUpdatedAt';
import setCreatedAt from 'models/plugins/setCreatedAt';

import UserAdmin from 'models/userAdmin';

const mixins = compose(
  setCreatedAt,
  setUpdatedAt
);

export default class User extends mixins(Model) {
  static tableName = 'users';

  static get relationMappings() {
    // eslint-disable-next-line global-require
    const Verification = require('models/verification').default;

    return {
      // Symmetric friendship relationships - both ends are friends
      friends: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        modify: (qb) => {
          qb.whereRaw('exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )'); //eslint-disable-line
        },
        join: {
          from: 'users.id',
          through: {
            from: 'friendships.userId',
            to: 'friendships.friendId'
          },
          to: 'users.id'
        }
      },

      // Other users requesting to be friends with me but I have yet to approve their friend requests
      pendingIncomingFriendRequests: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        modify: (qb) => {
          qb.whereRaw('not exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )'); //eslint-disable-line
        },
        join: {
          from: 'users.id',
          through: {
            from: 'friendships.friendId',
            to: 'friendships.userId'
          },
          to: 'users.id'
        }
      },

      // Me requesting to be friends with other users which have not been approved by my friends
      pendingOutgoingFriendRequests: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        modify: (qb) => {
          qb.whereRaw('not exists( select 1 from friendships f where f.friend_id = friendships.user_id and f.user_id = friendships.friend_id )'); //eslint-disable-line
        },
        join: {
          from: 'users.id',
          through: {
            from: 'friendships.userId',
            to: 'friendships.friendId'
          },
          to: 'users.id'
        }
      },

      verifications: {
        relation: Model.HasManyRelation,
        modelClass: Verification,
        join: {
          from: 'users.id',
          to: 'verifications.userId'
        }
      },

      userAdmin: {
        relation: Model.HasOneRelation,
        modelClass: UserAdmin,
        join: {
          from: 'users.id',
          to: 'users_admins.userId'
        }
      }
    };
  }
}
