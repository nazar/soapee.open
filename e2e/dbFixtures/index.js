const _ = require('lodash');
const { importSanitizer } = require('./utils');

const additives = importSanitizer(require('./additives'), ['user_id']);
const comments = importSanitizer(require('./comments'), ['user_id','commentable_id']);
const favourites = importSanitizer(require('./favourites.json'), ['user_id','recipe_id']);
const feeds = importSanitizer(require('./feeds'));
const friendships = importSanitizer(require('./friendships'), ['user_id','friend_id']);
const forums = importSanitizer(require('./forums'), ['user_id']);
const forumsLocked = importSanitizer(require('./forumsLocked'), ['locked_by_user_id', 'forum_id']);
const forumsTags = importSanitizer(require('./forumsTags.json'), ['forum_id', 'user_id']);
const forumsTaggables = importSanitizer(require('./forumsTaggables.json'), []);
const forumsUsersSubscriptions = importSanitizer(require('./forumsUsersSubscriptions'), ['forum_id', 'user_id']);
const forumsOfficial = importSanitizer(require('./forumsOfficial.json'), ['forum_id']);
const images = importSanitizer(require('./images.json'));
const notifications = importSanitizer(require('./notifications.json'));
const oils = importSanitizer(require('./oils'));
const posts = importSanitizer(require('./posts'), ['user_id', 'postable_id', 'locked_by_user_id']);
const reactions = importSanitizer(require('./reactions'), ['user_id']);
const recipeAdditives = importSanitizer(require('./recipeAdditives'), ['recipe_id', 'additive_id']);
const recipeOils = importSanitizer(require('./recipeOils'), ['recipe_id', 'oil_id']);
const recipeJournals = importSanitizer(require('./recipeJournals'), ['recipe_id']);
const recipes = importSanitizer(require('./recipes'), ['user_id']);
const users = importSanitizer(require('./users'));
const usersAdmin = importSanitizer(require('./usersAdmins'), ['user_id', 'added_by_user_id']);
const verifications = importSanitizer(require('./verifications'), ['user_id']);
const votes = importSanitizer(require('./votes'), ['voteable_id', 'user_id']);

module.exports = _.merge(
  {},
  additives,
  comments,
  favourites,
  feeds,
  forums,
  forumsLocked,
  forumsOfficial,
  forumsTags,
  forumsTaggables,
  forumsUsersSubscriptions,
  friendships,
  images,
  notifications,
  oils,
  posts,
  reactions,
  recipeAdditives,
  recipeOils,
  recipeJournals,
  recipes,
  users,
  usersAdmin,
  verifications,
  votes
);
