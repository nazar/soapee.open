import makeFriendLink from './services/friendship/makeFriendLink';
import removeFriendLink from './services/friendship/removeFriendLink';

export const friendshipTypeDefs = ` 
  extend type Mutation {
    makeFriendLink(toUserId: ID!): Friendship! @loggedIn
    removeFriendLink(toUserId: ID!): Friendship @loggedIn
  }
  
  type Friendship {
    id: ID!
    userId: ID!
    friendId: ID!
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    user: PublicUser!
    friend: PublicUser!
  }
`;

export const friendshipResolvers = {
  Friendship: {
    user: (friendship, obj2, context) => context.loaders.userById.load(friendship.userId),
    friend: (friendship, obj2, context) => context.loaders.userById.load(friendship.friendId)
  },
  Mutation: {
    makeFriendLink: (obj, { toUserId }, { user }) => makeFriendLink({ user, toUserId }),
    removeFriendLink: (obj, { toUserId }, { user }) => removeFriendLink({ user, toUserId })
  }
};
