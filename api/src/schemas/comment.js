import _ from 'lodash';
import Bluebird from 'bluebird';

import { emptyObjectChecker } from 'services/errors';

import createComment from './services/comment/createComment';
import deleteComment from './services/comment/deleteComment';
import getComments from './services/comment/getComments';
import getCommentsSummary from './services/comment/getCommentsSummary';
import getCommentableComments from './services/comment/getCommentableComments';
import getCommentableCommentsSummary from './services/comment/getCommentableCommentsSummary';
import getCommentable from './services/comment/getCommentable';
import updateComment from './services/comment/updateComment';

export const commentTypeDefs = `
  extend type Query {
    # get a comment by the comments.id
    comment(id: ID!): Comment!
    comments(
      search: CommentsSearchInput!
      order: CommentableOrderInput
      page: PaginationInput
    ): [Comment!]
    
    commentsSummary(search: CommentsSearchInput!): ListsSummary!
   
    # get comments for a commentable object
    commentableComments(
      commentable: CommentableInput!
      order: CommentableOrderInput
      page: PaginationInput
    ): [Comment!]
    
    # get comments summary (i.e. number of records) for a commentable object
    commentableCommentsSummary(
      commentable: CommentableInput!
    ): ListsSummary!
  }

  extend type Mutation {
    createComment(input: CommentCreateInput!): Comment! @loggedIn
    deleteComment(id: ID!): Comment! @loggedIn
    updateComment(id: ID!, input: CommentUpdateInput!): Comment! @loggedIn
  }
  
  # types

  type Comment {
    id: ID!,
    userId: ID!,
    commentableId: ID!,
    commentableType: CommentableType!,  
    comment: String!,
    stats: CommentStats,  
    lastEdited: GraphQLDateTime,
    createdAt: GraphQLDateTime,
    updatedAt: GraphQLDateTime,
    
    
    reactions: [Reaction]
    myVote: Vote,
    myFavourite: Favourite
    myReport: Report
    user: PublicUser
  }
  
  type CommentStats {
    votes : VoteStats
    scores: WilsonStats
    favourites: FavouriteStats
    reactions: [ReactionStats]
  }
  
  type CommentableStats {
    comments: Int
  }
  
  # enums
  
  enum CommentableType {
    posts
    recipes 
  }
  
  enum CommentFields {
    comment
    createdAt
    lastEdited
    userId
  }
  
  enum CommentOrderField {
    createdAt
    score
  }
  
  # inputs

  input CommentCreateInput {
    commentableId: ID!
    commentableType: CommentableType!    
    comment: String!
  }
  
  input CommentsSearchInput {
    userId: ID!
  }

  input CommentableInput {
    commentableId: ID!
    commentableType: CommentableType!
  }
  
  input CommentableOrderInput {
    field: CommentOrderField!
    direction: SortDirection!  
  } 
  
  input CommentUpdateInput {
    # the comment text
    comment: String!
  }
`;

export const commentResolvers = {
  CommentableStats: {
    comments: stats => _.get(stats, 'comments', 0)
  },
  Comment: {
    myVote: (comment, vars, { user, loaders }) => user && loaders.userVote.load({
      user,
      voteableId: comment.id,
      voteableType: 'comments'
    }),

    myFavourite: (comment, vars, { user, loaders }) => user && loaders.userFavourite.load({
      user,
      favouriteableId: comment.id,
      favouriteableType: 'comments'
    }),

    myReport: (comment, vars, { user, loaders }) => user && loaders.userReports.load({
      user,
      reportableId: comment.id,
      reportableType: 'comments'
    }),

    reactions: (comment, vars, { loaders }) =>
      loaders.reactionsForReactionable.load({ reactionableId: comment.id, reactionableType: 'comments' }),

    user: (comment, vars, context) => context.loaders.userById.load(comment.userId)
  },
  Query: {
    comment: (obj, { id }, context) => context.loaders.commentById.load(id),
    comments: (obj, { search, order, page }) => getComments({ search, order, page }),
    commentsSummary: (obj, { search, page }) => getCommentsSummary({ search, page }),
    commentableComments: (obj, { commentable, ...restInput }) =>
      Bluebird
        .resolve(getCommentable(commentable))
        .tap(emptyObjectChecker)
        .then(res => getCommentableComments({ commentable: res, ...restInput })),

    commentableCommentsSummary: (obj, { commentable, ...restInput }) =>
      Bluebird
        .resolve(getCommentable(commentable))
        .tap(emptyObjectChecker)
        .then(res => getCommentableCommentsSummary({ commentable: res, ...restInput }))

  },
  Mutation: {
    createComment: (obj, { input: { commentableId, commentableType, comment } }, { user }) =>
      createComment({ user, commentableId, commentableType, comment }),

    deleteComment: (obj, { id }, { user }) => deleteComment({ user, id }),

    updateComment: (obj, { id, input: { comment } }, { user }) =>
      updateComment({ user, id, comment })
  }
};
