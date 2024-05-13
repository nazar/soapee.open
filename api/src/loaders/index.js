import _ from 'lodash';
import DataLoader from 'dataloader';
import { raw, ref } from 'objection';

import Additive from 'models/additive';
import Comment from 'models/comment';
import Favourite from 'models/favourite';
import Forum from 'models/forum';
import ForumLocked from 'models/forumLocked';
import ForumModerator from 'models/forumModerator';
import ForumTag from 'models/forumTag';
import ForumTaggable from 'models/forumTaggable';
import ForumUserSubscription from 'models/forumUserSubscription';
import Image from 'models/image';
import Oil from 'models/oil';
import Post from 'models/post';
import Reaction from 'models/reaction';
import Recipe from 'models/recipe';
import RecipeAdditive from 'models/recipeAdditive';
import RecipeOil from 'models/recipeOil';
import Report from 'models/report';
import User from 'models/user';
import UserAdmin from 'models/userAdmin';
import Vote from 'models/vote';

export default function(options = {}) {
  return {
    // ID loaders
    additiveById: new DataLoader(ids => modelIdFetcher(Additive, ids), options),
    commentById: new DataLoader(ids => modelIdFetcher(Comment, ids), options),
    forumsById: new DataLoader(ids => modelIdFetcher(Forum, ids), options),
    forumTagById: new DataLoader(ids => modelIdFetcher(ForumTag, ids), options),
    forumTagsByForumId: new DataLoader(ids => modelHasManyFetcher(ForumTag, ids, 'forumId'), options),
    forumTaggableById: new DataLoader(ids => modelIdFetcher(ForumTaggable, ids), options),
    forumTaggablesByPostId: new DataLoader(ids => modelHasManyFetcher(ForumTaggable, ids, 'postId'), options),
    oilById: new DataLoader(ids => modelIdFetcher(Oil, ids), options),
    postsById: new DataLoader(ids => modelIdFetcher(Post, ids, 'id', { paranoid: true }), options),
    recipeById: new DataLoader(ids => modelIdFetcher(Recipe, ids), options),
    recipeAdditiveById: new DataLoader(ids => modelIdFetcher(RecipeAdditive, ids), options),
    recipeOilById: new DataLoader(ids => modelIdFetcher(RecipeOil, ids), options),
    recipeAdditivesByRecipeId: new DataLoader(ids => modelHasManyFetcher(RecipeAdditive, ids, 'recipeId'), options),
    recipeOilsByRecipeId: new DataLoader(ids => modelHasManyFetcher(RecipeOil, ids, 'recipeId'), options),
    userById: new DataLoader(ids => modelIdFetcher(User, ids), options),
    forumUserSubscription: new DataLoader(inputs => forumUserSubscriptionFetched(inputs), {
      ...options,
      cacheKeyFn: ({ userId, forumId }) => `${userId}-${forumId}`
    }),

    // relational loaders
    forumTagsByPostId: new DataLoader(postIds => forumTagsByPostId(postIds), options),
    recipesByOil: new DataLoader(oils => recipeByOilsFetcher(oils), { ...options, cacheKeyFn }),
    postsForForum: new DataLoader(forumsObjects => postsForForumFetcher(forumsObjects), {
      ...options,
      cacheKeyFn: objectCacheKeyFn
    }),
    activePostsForForum: new DataLoader(forumsObjects => activePostsForForumFetcher(forumsObjects), {
      ...options,
      cacheKeyFn: objectCacheKeyFn
    }),
    locksForForumId: new DataLoader(
      ids => modelHasManyFetcher(ForumLocked, ids, 'forumId', { paranoid: true }), options
    ),
    moderatorsForForumId: new DataLoader(ids => modelHasManyFetcher(ForumModerator, ids, 'forumId'), options),
    reactionsForReactionable: new DataLoader(reactionableObjects => reactionsForReactionable(reactionableObjects), {
      ...options,
      cacheKeyFn: ReactionableCacheKeyFn
    }),
    userProfileImageFromImageable: new DataLoader(ids => userProfileImageFromImageable(ids), options),
    userIsAdminLoader: new DataLoader(ids => modelIdFetcher(UserAdmin, ids, 'userId'), options),
    recipeImageFromImageable: new DataLoader(ids => recipeImageFromImageable(ids), options),

    // polymorphic loaders
    commentable: new DataLoader(comments => commentableFetcher(comments), { ...options, cacheKeyFn }),
    userVote: new DataLoader(voteables => votesFetcher(voteables), { ...options, cacheKeyFn: VoteableCacheKeyFn }),
    userFavourite: new DataLoader(favouriteables => favouritesFetcher(favouriteables), {
      ...options,
      cacheKeyFn: FavouriteableCacheKeyFn
    }),
    userReports: new DataLoader(favouriteables => reportsFetcher(favouriteables), {
      ...options,
      cacheKeyFn: ReportableCacheKeyFn
    }),
    // postable
    postable: new DataLoader(posts => postableFetcher(posts), { ...options, cacheKeyFn }),
    // voteable
    voteable: new DataLoader(votes => voteableFetcher(votes), { ...options, cacheKeyFn }),
    reactionable: new DataLoader(reactions => reactionableFetcher(reactions), { ...options, cacheKeyFn })
  };
}

// fetchers

function modelIdFetcher(Model, ids, idKey = 'id', { paranoid = false } = {}) {
  const query = Model.query();

  paranoid && query.whereNotDeleted();

  return query
    .whereIn(idKey, _.uniq(ids))
    .then(rows => matchSingleResultToQueryOrder(rows, ids, idKey));
}

function modelHasManyFetcher(Model, ids, idKey, { paranoid = false } = {}) {
  const query = Model.query();

  paranoid && query.whereNotDeleted();

  return query
    .whereIn(idKey, _.uniq(ids))
    .then(rows => matchMultipleResultToQueryOrder(rows, ids, idKey));
}

function forumTagsByPostId(postIds) {
  return ForumTag
    .query()
    .select('forums_tags.*')
    .select('forums_taggables.postId')
    .join('forums_taggables', { 'forums_taggables.forumTagId': 'forums_tags.id' })
    .whereIn('forums_taggables.postId', postIds)
    .then(rows => matchMultipleResultToQueryOrder(rows, postIds, 'postId'));
}

function recipeByOilsFetcher(oils) {
  const oilIds = _.map(oils, 'id');

  return Recipe
    .query()
    .select('recipes.*')
    .select('recipe_oils.oilId')
    .join('recipe_oils', { 'recipe_oils.recipeId': 'recipes.id' })
    .whereIn('recipe_oils.oilId', oilIds)
    .where({ visibility: 1 })
    .then(rows => matchMultipleResultToQueryOrder(rows, oilIds, 'oilId'));
}

function userProfileImageFromImageable(userIds) {
  return Image
    .query()
    .where({ imageableType: 'user_profile' })
    .whereIn('imageableId', userIds)
    .then(rows => matchSingleResultToQueryOrder(rows, userIds, 'imageableId'));
}

function recipeImageFromImageable(recipeIds) {
  return Image
    .query()
    .where({ imageableType: 'recipes' })
    .whereIn('imageableId', recipeIds)
    .then(rows => matchSingleResultToQueryOrder(rows, recipeIds, 'imageableId'));
}

function forumUserSubscriptionFetched(inputs) {
  const userForumTuples = _.chain(inputs)
    .map(({ forumId, userId }) => ([forumId, userId]))
    .uniqBy(([forumId, userId]) => `${forumId}-${userId}`)
    .value();

  return ForumUserSubscription
    .query()
    .whereIn(raw('(forum_id, user_id)'), userForumTuples)
    .then((rows) => {
      const lookup = _.keyBy(rows, ({ forumId, userId }) => `${forumId}-${userId}`);

      return _.map(inputs, ({ forumId, userId }) => lookup[`${forumId}-${userId}`]);
    });
}

function postsForForumFetcher(forumObjects) {
  const forumIds = _.chain(forumObjects).map('object.id').uniq().value();
  const limit = forumObjects[0].options.limit; //eslint-disable-line

  const sub = Post
    .query()
    .whereNotDeleted()
    .select('posts.*')
    .select(raw('row_number() OVER (PARTITION BY postable_id order by created_at desc) as row_number'))
    .where({ postableType: 'forums' })
    .whereIn('posts.postableId', forumIds)
    .as('sub');

  return Post
    .query()
    .from(sub)
    .where('row_number', '<=', limit)
    .then(rows => matchMultipleResultToQueryOrder(rows, forumIds, 'postableId'));
}

function activePostsForForumFetcher(forumObjects) {
  const forumIds = _.chain(forumObjects).map('object.id').uniq().value();
  const limit = forumObjects[0].options.limit; //eslint-disable-line

  const sub = Post
    .query()
    .whereNotDeleted()
    .select('posts.*')
    .select(raw('row_number() OVER (PARTITION BY postable_id order by commented_at desc) as row_number'))
    .where({ postableType: 'forums' })
    .whereNotNull(ref('stats:comments.comments'))
    .whereIn('posts.postableId', forumIds)
    .as('sub');

  return Post
    .query()
    .from(sub)
    .where('row_number', '<=', limit)
    .then(rows => matchMultipleResultToQueryOrder(rows, forumIds, 'postableId'));
}

function reactionsForReactionable(reactionables) {
  const reactionableIds = _.chain(reactionables).map('reactionableId').uniq().value();
  const reactionableType = reactionables[0].reactionableType; //eslint-disable-line

  return Reaction
    .query()
    .select('reactions.*')
    .whereIn('reactions.reactionableId', reactionableIds)
    .where({ reactionableType })
    .then(rows => matchMultipleResultToQueryOrder(rows, reactionableIds, 'reactionableId'));
}

function commentableFetcher(comments) {
  const types = {
    posts: Post,
    recipes: Recipe
  };

  return polymorphicFetcher({
    polys: comments,
    polyName: 'commentable',
    types
  });
}

function postableFetcher(posts) {
  const types = {
    forums: Forum,
    oils: Oil
  };

  return polymorphicFetcher({
    polys: posts,
    polyName: 'postable',
    types
  });
}

function voteableFetcher(votes) {
  const types = {
    comments: Comment,
    posts: Post,
    recipes: Recipe
  };

  return polymorphicFetcher({
    polys: votes,
    polyName: 'voteable',
    types
  });
}

function reactionableFetcher(reactions) {
  const types = {
    comments: Comment
  };

  return polymorphicFetcher({
    polys: reactions,
    polyName: 'reactionable',
    types
  });
}

// both votesFetcher and favouritesFetcher can be refactor to
// return user's polymorphic associations

function votesFetcher(voteables) {
  return polymorphicUserHasOneFetcher(Vote, voteables, 'voteableId', 'voteableType');
}

function favouritesFetcher(favouriteables) {
  return polymorphicUserHasOneFetcher(Favourite, favouriteables, 'favouriteableId', 'favouriteableType');
}

function reportsFetcher(reportables) {
  return polymorphicUserHasOneFetcher(Report, reportables, 'reportableId', 'reportableType');
}

function polymorphicUserHasOneFetcher(Model, hasOneables, idField, typeField) {
  // fetches belongsTo associations with the assumption that
  // hasOneable.userId and hasOneable.oneableType are the same and on hasOneable.oneableId is different
  const userId = hasOneables[0].user.id;
  const oneableType = hasOneables[0][typeField];
  const ids = _.chain(hasOneables).map(idField).uniq().value();

  return Model
    .query()
    .where({
      userId
    })
    .where(typeField, '=', oneableType)
    .whereIn(idField, ids)
    .then((rows) => {
      const keys = _.keyBy(rows, row => `${row[idField]}:${row[typeField]}`);

      return _.map(hasOneables, hasOneable => keys[`${hasOneable[idField]}:${hasOneable[typeField]}`]);
    });
}

// support functions

function matchMultipleResultToQueryOrder(rows, ids, idKey = 'id') {
  const keys = _.groupBy(rows, idKey);

  return _.map(ids, id => keys[id]);
}

function matchSingleResultToQueryOrder(rows, ids, idKey = 'id') {
  const keys = _.keyBy(rows, idKey);

  return _.map(ids, id => keys[id]);
}

function polymorphicFetcher({ polys, polyName, types }) {
  const idKey = `${polyName}Id`;
  const typeKey = `${polyName}Type`;

  const polyTypes = _.groupBy(polys, typeKey);

  const queries = _.map(polyTypes, (values, type) => types[type]
    .query()
    .select(`${type}.*`)
    .select(Post.knex().raw(`'${type}' as "${typeKey}"`))
    .whereIn('id', _.map(values, idKey)));

  const [first, ...unions] = queries;

  if (!(_.isEmpty(unions))) {
    if (_.get(unions, 'length')) {
      _.each(unions, union => first.union(union));
    } else {
      _.each([unions], union => first.union(union));
    }
  }

  return first
    // improve efficiency on next dev iteration
    .then(rows => _.map(polys, poly => _.find(rows, {
      id: Number(poly[idKey]),
      [typeKey]: poly[typeKey]
    })));
}

function cacheKeyFn(obj) {
  return obj.id;
}

function objectCacheKeyFn(obj) {
  return obj.object.id;
}

function VoteableCacheKeyFn(obj) {
  return `${obj.voteableId}:${obj.voteableType}`;
}

function FavouriteableCacheKeyFn(obj) {
  return `${obj.favouriteableId}:${obj.favouriteableType}`;
}

function ReactionableCacheKeyFn(obj) {
  return `${obj.reactionableId}:${obj.reactionableType}`;
}

function ReportableCacheKeyFn(obj) {
  return `${obj.reportableId}:${obj.reportableType}`;
}
