import Bluebird from 'bluebird';

import { emptyObjectChecker } from 'services/errors';
import { stripAllHtml } from 'services/sanitiseHtml';

import createForumPost from './services/post/createForumPost';
import createPost from './services/post/createPost';
import getPosts from './services/post/getPosts';
import getPostsSummary from './services/post/getPostsSummary';
import getPostable from './services/post/getPostable';
import getPostablePosts from './services/post/getPostablePosts';
import getPostablePostsSummary from './services/post/getPostablePostsSummary';
import deletePost from './services/post/deletePost';
import lockPost from './services/post/lockPost';
import unlockPost from './services/post/unlockPost';
import updatePost from './services/post/updatePost';
import updateForumPost from './services/post/updateForumPost';


export const postTypeDefs = `
  extend type Query {
    post(id: ID!): Post
    
    posts(
      search: PostsSearchInput!
      page: PaginationInput
      order: PostOrderInput
    ): [Post!]
    
    postsSummary(search: PostsSearchInput!): ListsSummary!
    
    postablePosts(
      postable: PostableInput!
      order: PostableOrderInput
      page: PaginationInput
    ): [Post!]
    
    postablePostsSummary(postable: PostableInput!): ListsSummary!
  }

  extend type Mutation {
    createPost(input: PostCreateInput!): Post! @loggedIn
    createForumPost(input: CreateForumPostInput!): Post! @loggedIn
    deletePost(id: ID!): Post! @loggedIn
    lockPost(id: ID!): Post! @loggedIn
    unlockPost(id: ID!): Post! @loggedIn
    updatePost(input: PostUpdateInput!): Post! @loggedIn
    updateForumPost(input: ForumPostUpdateInput!): Post! @loggedIn
  }
  
  # types

  # A Post belongs to a forum and can have many Comments
  type Post {
    id: ID!
    userId: ID!
    postableId: ID!
    lockedByUserId: ID
    postableType: PostableType!
    
    title: String!
    content: String!
    # content stripped of HTML
    contentStr: String!
    locked: Boolean
    lockAt: GraphQLDateTime
    stats: PostStats

    lastEdited: GraphQLDateTime    
    lockedAt: GraphQLDateTime
    commentedAt: GraphQLDateTime
    createdAt: GraphQLDateTime
    updatedAt: GraphQLDateTime
    
    myVote: Vote
    myFavourite: Favourite
    myReport: Report
    postable: PostableObject!
    lockedByUser: PublicUser
    user: PublicUser
    reactions: [Reaction]
    forumTaggables: [ForumTaggable]
    # forumTags: [ForumTag]
  }
  
  type PostableObject {
    id: ID!
    name: String!
    summary: String! #todo not sure about summary - remove?
    userCanEdit: Boolean
  }
  
  type PostStats {
    comments: CommentableStats,
    votes: VoteStats,
    scores: WilsonStats,
    favourites: FavouriteStats
  }
  
  type PostableStats {
    posts: Int
  }
  
  # enums
  
  enum PostableType {
    forums
    oils
  }
  
  enum PostableOrderField {
    score
    latestActivity
    createdAt
  }
  
  enum PostOrderField {
    createdAt
    score
  }
  
  # inputs
  
  input PostableInput {
    postableId: ID! 
    postableType: PostableType! 
  }
  
  input PostsSearchInput {
    userId: ID
    searchTerm: String
    postableType: PostableType
  }
  
  input PostableOrderInput {
    field: PostableOrderField!,
    direction: SortDirection!  
  }
  
  input PostCreateInput {
    postableId: ID! 
    postableType: PostableType! 
    title: String!
    content: String!
  }
  
  input CreateForumPostInput {
    forumId: ID!
    title: String!
    content: String!
    forumTags: [ID!]
  }

  input PostUpdateInput {
    id: ID!
    title: String!
    content: String!
  }
  
  input ForumPostUpdateInput {
    id: ID!
    title: String!
    content: String!
    forumTags: [ID!]
  }

  input PostOrderInput {
    field: PostOrderField!
    direction: SortDirection!  
  } 
`;

export const postResolvers = {
  Post: {
    lockedByUser: (post, vars, { loaders }) => loaders.userById.load(post.lockedByUserId),
    //forumTags: ({ id }, vars, { loaders }) => loaders.forumTagsByPostId.load(id),
    forumTaggables: ({ id }, vars, { loaders }) => loaders.forumTaggablesByPostId.load(id),
    myVote: (post, vars, { loaders, user }) => user && loaders.userVote.load({
      user,
      voteableId: post.id,
      voteableType: 'posts'
    }),

    myFavourite: (post, vars, { loaders, user }) => user && loaders.userFavourite.load({
      user,
      favouriteableId: post.id,
      favouriteableType: 'posts'
    }),

    myReport: (post, vars, { loaders, user }) => user && loaders.userReports.load({
      user,
      reportableId: post.id,
      reportableType: 'posts'
    }),

    postable: (post, vars, { loaders }) => loaders.postable.load(post),
    user: (post, vars, { loaders }) => loaders.userById.load(post.userId),

    contentStr: post => post?.content && stripAllHtml(post.content),

    reactions: (post, vars, { loaders }) =>
      loaders.reactionsForReactionable.load({ reactionableId: post.id, reactionableType: 'posts' })
  },

  PostableObject: {
    userCanEdit: (postable, vars, { user }) => Number(postable.userId) === Number(user.id)
  },
  Query: {
    // FIXME convert post into a service to check for access permissions, etc
    post: (obj, { id }, { loaders }) => loaders.postsById.load(id),
    posts: (obj, { search, page, order }) => getPosts({ search, page, order }),
    postsSummary: (obj, { search }) => getPostsSummary({ search }),
    postablePosts: (obj, { postable, ...restInput }, { user }) => Bluebird
      .resolve(getPostable(postable))
      .tap(emptyObjectChecker)
      .then(res => getPostablePosts({ postable: res, user, ...restInput })),

    postablePostsSummary: (obj, { postable, ...restInput }, { user }) => Bluebird
      .resolve(getPostable(postable))
      .tap(emptyObjectChecker)
      .then(res => getPostablePostsSummary({ postable: res, user, ...restInput }))
  },
  Mutation: {
    createPost: (obj, { input }, { user }) => createPost({ user, input }),
    createForumPost: (obj, { input }, { user }) => createForumPost({ user, input }),
    deletePost: (obj, { id }, { user }) => deletePost({ user, id }),
    lockPost: (obj, { id }, { user }) => lockPost({ user, id }),
    unlockPost: (obj, { id }, { user }) => unlockPost({ user, id }),
    updatePost: (obj, { input }, { user }) => updatePost({ user, input }),
    updateForumPost: (obj, { input }, { user }) => updateForumPost({ user, input })
  }
};
