import _ from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

import GraphQLJSON from 'graphql-type-json';
import { GraphQLDateTime } from 'graphql-iso-date';
import { GraphQLUpload } from 'graphql-upload';

import commonTypeDefs from 'schemas/common';
import { additiveTypeDefs, additiveResolvers } from 'schemas/additive';
import { commentTypeDefs, commentResolvers } from 'schemas/comment';
import { favouriteTypeDefs, favouriteResolvers } from 'schemas/favourite';
import { feedTypeDefs, feedResolvers } from 'schemas/feed';
import { forumTypeDefs, forumResolvers } from 'schemas/forum';
import { forumLockedTypeDefs, forumLockedResolvers } from 'schemas/forumLocked';
import { forumModeratorTypeDefs, forumModeratorResolvers } from 'schemas/forumModerator';
import { forumTagTypeDefs, forumTagResolvers } from 'schemas/forumTag';
import { forumTaggableTypeDefs, forumTaggableResolvers } from 'schemas/forumTaggable';
import { forumUserSubscriptionTypeDefs, forumUserSubscriptionResolvers } from 'schemas/forumUserSubscription';
import { friendshipTypeDefs, friendshipResolvers } from 'schemas/friendship';
import { imageTypeDefs, imageResolvers } from 'schemas/image';
import { notificationTypeDefs, notificationResolvers } from 'schemas/notification';
import { oilTypeDefs, oilResolvers } from 'schemas/oil';
import { postTypeDefs, postResolvers } from 'schemas/post';
import { reactionTypeDefs, reactionResolvers } from 'schemas/reaction';
import { recipeTypeDefs, recipeResolvers } from 'schemas/recipe';
import { recipeAdditiveTypeDefs, recipeAdditiveResolvers } from 'schemas/recipeAdditive';
import { recipeOilTypeDefs, recipeOilResolvers } from 'schemas/recipeOil';
import { recipeJournalTypeDefs, recipeJournalResolvers } from 'schemas/recipeJournal';
import { reportTypeDefs, reportResolvers } from 'schemas/report';
import { userTypeDefs, userResolvers } from 'schemas/user';
import { verificationTypeDefs } from 'schemas/verification';
import { voteTypeDefs, voteResolvers } from 'schemas/vote';

import { adminTypeDefs, adminDirectiveTransformer } from 'schemas/directives/admin';
import { loggedInTypeDefs, loggedInDirectiveTransformer } from 'schemas/directives/loggedIn';

const scalars = `
  scalar JSON
  scalar GraphQLDateTime
  scalar Upload
`;

// global enums
const enums = `
  enum Visibility {
    private
    friends
    public
  }
  
  enum SortDirection {
    asc
    desc
  }
`;

// define base types here so that we can include Query, Mutation and Subscription
// in each typeDef file
const Query = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

// type Subscription {
//   _empty: String
// }


const ScalerResolvers = {
  JSON: GraphQLJSON,
  GraphQLDateTime,
  Upload: GraphQLUpload
};

export default makeExecutableSchema({
  typeDefs: [
    Query,
    enums,
    scalars,
    commonTypeDefs,

    adminTypeDefs,
    loggedInTypeDefs,

    additiveTypeDefs,
    commentTypeDefs,
    favouriteTypeDefs,
    feedTypeDefs,
    forumTypeDefs,
    forumLockedTypeDefs,
    forumModeratorTypeDefs,
    forumTagTypeDefs,
    forumTaggableTypeDefs,
    forumUserSubscriptionTypeDefs,
    friendshipTypeDefs,
    imageTypeDefs,
    notificationTypeDefs,
    oilTypeDefs,
    postTypeDefs,
    reactionTypeDefs,
    recipeTypeDefs,
    recipeAdditiveTypeDefs,
    recipeOilTypeDefs,
    recipeJournalTypeDefs,
    reportTypeDefs,
    userTypeDefs,
    verificationTypeDefs,
    voteTypeDefs
  ],
  resolvers: _.merge(
    ScalerResolvers,

    additiveResolvers,
    commentResolvers,
    favouriteResolvers,
    feedResolvers,
    forumResolvers,
    forumLockedResolvers,
    forumModeratorResolvers,
    forumTagResolvers,
    forumTaggableResolvers,
    forumUserSubscriptionResolvers,
    friendshipResolvers,
    imageResolvers,
    notificationResolvers,
    oilResolvers,
    postResolvers,
    reactionResolvers,
    recipeResolvers,
    recipeAdditiveResolvers,
    recipeOilResolvers,
    recipeJournalResolvers,
    reportResolvers,
    userResolvers,
    voteResolvers
  ),
  schemaTransforms: [
    adminDirectiveTransformer,
    loggedInDirectiveTransformer
  ]
});
