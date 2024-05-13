import Bluebird from 'bluebird';

import { emptyObjectChecker } from 'services/errors';
import { stripAllHtml } from 'services/sanitiseHtml';

import createForum from './services/forum/createForum';
import updateForum from './services/forum/updateForum';
import getForum from './services/forum/getForum';
import getForums from './services/forum/getForums';
import getForumsSummary from './services/forum/getForumsSummary';
import forumExists from './services/forum/forumExists';

export const forumTypeDefs = `
  extend type Query {
    forum(id: ID!): Forum!
    forums(search: ForumSearchInput, order: ForumOrderInput, page: PaginationInput): [Forum!]
    forumsSummary(search: ForumSearchInput): ListsSummary!
    forumExists(name: String!): Boolean
  }

  extend type Mutation {
    createForum(input: ForumCreateInput!): Forum! @loggedIn
    updateForum(id: ID!, input: ForumUpdateInput!): Forum! @loggedIn
  }
  
  # types

  # A Forum is a user generated space that is public or private. A Forum has many posts and each post has
  # many comments.
  type Forum {
    id: ID!
    # the \`users.id\` who created and owns the forum
    userId: ID!
    name: String!
    summary: String!
    banner: String!
    # HTML stripped version of banner
    bannerStr: String

    forumType: FormType!
    stats: ForumStats

    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime

    # returns a sample of posts, limited to 1 by default sorted by descending order
    posts(limit: Int): [Post!]
    
    # returns a sample of last commented posts, limited to 1 by default sorted by descending order
    activePosts(limit: Int): [Post!]
    
    # forums I've favourited
    # TODO this might be redundant since mySubscription
    myFavourite: Favourite
    
    # forums I've reported
    myReport: Report
    
    # forums I've subscribed to
    mySubscription: ForumUserSubscription
    
    # forum moderators
    moderators: [ForumModerator!]
    
    # is this forum locked?
    locks: [ForumLocked!]
    
    # forumTags associated with this forum's posts
    forumTags: [ForumTag]
    
    # the user that owns the forum
    user: PublicUser
  }
  
  type ForumStats {
    posts: PostableStats,
    comments: CommentableStats
    subscriptions: Int
  }
  
    
  type SubscriptionStats {
    subscriptions: Int
  }
  
  # enums
  
  enum FormType {
    public
    restricted
    invite
  }

  enum ForumOrderField {
    name
    popular
    createdAt
  }
  
  # inputs
  
  input ForumOrderInput {
    field: ForumOrderField!
    direction: SortDirection  
  }
  
  input ForumTagFieldInput {
    id: ID
    tag: String!
    color: ForumTagColor!
  }
  
  input ForumCreateInput {
    name: String!
    summary: String!
    banner: String!
    forumTags: [ForumTagFieldInput]
    forumType: FormType!
  }

  input ForumUpdateInput {
    summary: String!
    banner: String!
    forumTags: [ForumTagFieldInput]
    forumType: FormType!
  }
  
  input ForumSearchInput {
    # returns matches to forums.name
    name: String
    # returns matches to forums.summary and banner
    text: String
    # indicates whether to return official forums
    official: Boolean
    # returns forums created by and owned by the current user
    mine: Boolean
    # returns forums subscribed by the current user - links to table \`forums_users_subscriptions\`
    subscribed: Boolean
    # returns forums created by given user id
    userId: ID 
  }
`;

export const forumResolvers = {
  Forum: {
    posts: (forum, { limit = 1 }, context) =>
      context.loaders.postsForForum.load({ object: forum, options: { limit } }),

    activePosts: (forum, { limit = 1 }, context) =>
      context.loaders.activePostsForForum.load({ object: forum, options: { limit } }),

    forumTags: ({ id }, vars, { loaders }) =>
      loaders.forumTagsByForumId.load(id),

    locks: (forum, vars, context) =>
      context.loaders.locksForForumId.load(forum.id),

    moderators: (forum, vars, context) =>
      context.loaders.moderatorsForForumId.load(forum.id),

    myFavourite: (forum, vars, { user, loaders }) => user && loaders.userFavourite.load({
      user,
      favouriteableId: forum.id,
      favouriteableType: 'forums'
    }),

    myReport: (forum, vars, { user, loaders }) => user && loaders.userReports.load({
      user,
      reportableId: forum.id,
      reportableType: 'forums'
    }),

    mySubscription: (forum, vars, { user, loaders }) =>
      user && loaders.forumUserSubscription.load({ userId: user.id, forumId: forum.id }),

    user: (forum, vars, context) => context.loaders.userById.load(forum.userId),

    bannerStr: forum => forum?.banner && stripAllHtml(forum.banner)
  },
  Query: {
    forum: (obj, { id }) => Bluebird.resolve(getForum({ id })).tap(emptyObjectChecker),

    forums: (obj, {
      search,
      order: { field = 'createdAt', direction = 'asc' } = {},
      page: { limit = 10, offset = 0 } = {}
    }, { user }) =>
      getForums({ currentUser: user, search, order: { field, direction }, page: { limit, offset } }),

    forumsSummary: (obj, { search }, { user }) =>
      getForumsSummary({ currentUser: user, search }),

    forumExists: (obj, { name }) => forumExists({ name })
  },
  Mutation: {
    createForum: (obj, { input }, { user }) => createForum({ user, input }),

    updateForum: (obj, { id, input }, { user }) => updateForum({ id, input, user })
  }
};
