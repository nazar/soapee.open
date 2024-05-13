const _ = require('lodash');

const { importSanitizer } = require('./utils');

const comments = importSanitizer(require('./comments'), ['user_id', 'commentable_id']);
const favourites = importSanitizer(require('./favourites'), ['user_id', 'favouriteable_id']);
const friendships = importSanitizer(require('./friendships'), ['user_id', 'friend_id']);
const forums = importSanitizer(require('./forums'), ['user_id']);
const forumsLocked = importSanitizer(require('./forumsLocked'), ['locked_by_user_id', 'forum_id']);
const oils = importSanitizer(require('./oils'));
const posts = importSanitizer(require('./posts'), ['user_id', 'postable_id', 'locked_by_user_id']);
const reactions = importSanitizer(require('./reactions'), ['user_id']);
const recipe_oils = importSanitizer(require('./recipeOils'), ['recipe_id', 'oil_id']);
const recipes = importSanitizer(require('./recipes'), ['user_id']);
const users = importSanitizer(require('./users'));
const verifications = importSanitizer(require('./verifications'), ['user_id']);

module.exports = _.merge(
  {},
  comments,
  favourites,
  forums,
  forumsLocked,
  friendships,
  oils,
  posts,
  reactions,
  recipe_oils,
  recipes,
  users,
  verifications
);
