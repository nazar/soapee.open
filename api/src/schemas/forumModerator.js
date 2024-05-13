export const forumModeratorTypeDefs = `
  # types

  type ForumModerator {
    id: ID!,
    userId: ID!,
    addedByUserId: ID!,
    forumId: ID!,
    createdAt: GraphQLDateTime,
    updatedAt: GraphQLDateTime,
    
    addedByUser: PublicUser!
    forum: Forum!
    user: PublicUser!
  }
`;

export const forumModeratorResolvers = {
  ForumModerator: {
    addedByUser: (forumModerator, vars, context) => context.loaders.userById.load(forumModerator.addedByUserId),
    forum: (forumModerator, vars, context) => context.loaders.forumsById.load(forumModerator.forumId),
    user: (forumModerator, vars, context) => context.loaders.userById.load(forumModerator.userId)
  }
};
