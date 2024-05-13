export const forumTaggableTypeDefs = `
  extend type Query {
    forumTaggable(id: ID!): ForumTaggable!
  }

  type ForumTaggable {
    id: ID!
    forumTagId: ID!
    postId: ID!

    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    forumTag: ForumTag!
    post: Post!
  }
`;

export const forumTaggableResolvers = {
  ForumTaggable: {
    forumTag: ({ forumTagId }, vars, { loaders }) => loaders.forumTagById.load(forumTagId),
    post: ({ userId }, vars, { loaders }) => loaders.postsById.load(userId)
  },
  Query: {
    forumTaggable: (obj, { id }, { loaders }) => loaders.forumTaggableById.load(id)
  }
};
