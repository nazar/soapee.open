import Oil from 'models/oil';
import Post from 'models/post';
import Recipe from 'models/recipe';

export default function getComments({ commentableId, commentableType }) {
  const Model = {
    oils: Oil,
    posts: Post,
    recipes: Recipe
  }[commentableType];

  return Model
    .query()
    .findById(commentableId);
}
