// eslint-disable-next-line max-len
import forumUserSubscriptionToggleCurrentUser from './services/forumUserSubscription/forumUserSubscriptionToggleCurrentUser';

export const forumUserSubscriptionTypeDefs = `

  # mutations
  
  extend type Mutation {
    forumUserSubscriptionToggleCurrentUser(forumId: ID!): ForumUserSubscription
      @loggedIn
  }
  
  # types

  # links users to forums for subscriptions
  type ForumUserSubscription {
    id: ID!,
    userId: ID!,
    forumId: ID!,
    createdAt: GraphQLDateTime,
    
    forum: Forum!
    user: PublicUser!
  }
`;

export const forumUserSubscriptionResolvers = {
  ForumUserSubscription: {
    forum: (forumSub, vars, context) =>
      context.loaders.forumsById.load(forumSub.forumId),

    user: (forumSub, vars, context) =>
      context.loaders.userById.load(forumSub.userId)
  },
  Mutation: {
    forumUserSubscriptionToggleCurrentUser: (obj, { forumId }, { user }) =>
      forumUserSubscriptionToggleCurrentUser({ forumId, user })
  }
};
