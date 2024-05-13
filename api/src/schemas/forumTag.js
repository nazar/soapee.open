import getForumTags from 'schemas/services/forumTag/getForumTags';

export const forumTagTypeDefs = `
  extend type Query {
    forumTag(id: ID!): ForumTag!
    forumTags(search: ForumTagsSearchInput!): [ForumTag!]
  }

  type ForumTag {
    id: ID!
    forumId: ID!
    tag: String!
    color: String
    userId: ID!
    stats: ForumTagStats
    
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    forum: Forum!
    user: PublicUser!
  }
  
  type ForumTagStats {
    posts: ForumTagCountStat
  }
  
  type ForumTagCountStat {
    count: Int
  }
  
  
  input ForumTagsSearchInput {
    forumId: ID!
  }
  

  enum ForumTagColor {
    red
    orange
    yellow
    olive
    green
    teal
    blue
    violet
    purple
    pink
    brown
    grey
    black  
  }
`;

export const forumTagResolvers = {
  ForumTag: {
    forum: ({ forumId }, vars, { loaders }) => loaders.forumsById.load(forumId),
    user: ({ userId }, vars, { loaders }) => loaders.userById.load(userId)
  },
  Query: {
    forumTag: (obj, { id }, { loaders }) => loaders.forumTagById.load(id),
    forumTags: (obj, { search }) => getForumTags({ search })
  }
};
