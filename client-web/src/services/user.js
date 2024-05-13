import _ from 'lodash';

export function getUserKarma(user) {
  return Number(_.get(user, 'stats.karma.posts') || '0')
    + Number(_.get(user, 'stats.karma.comments') || '0')
    + Number(_.get(user, 'stats.karma.recipes') || '0');
}

export function getUserCountStats(user) {
  const posts = Number(_.get(user, 'stats.karma.posts') || '0');
  const comments = Number(_.get(user, 'stats.karma.comments') || '0');
  const recipes = Number(_.get(user, 'stats.karma.recipes') || '0');

  return {
    posts,
    comments,
    recipes
  };
}
