export const forumLockedTypeDefs = `
  # types

  type ForumLocked {
    id: ID!,
    lockedByUserId: ID!,
    forumId: ID!,
    createdAt: GraphQLDateTime,
    deletedAt: GraphQLDateTime,
    updatedAt: GraphQLDateTime,
    
    lockedByUser: PublicUser!
    forum: Forum!
  }
`;

export const forumLockedResolvers = {
  ForumLocked: {
    lockedByUser: (forumLocked, vars, context) => context.loaders.userById.load(forumLocked.lockedByUserId),
    forum: (forumLocked, vars, context) => context.loaders.forumsById.load(forumLocked.forumId)
  }
};
