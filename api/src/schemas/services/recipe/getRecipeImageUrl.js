import getImageUrl from '../image/getImageUrl';

export default function getRecipeImageUrl({ image, thumbnail }) {
  return getImageUrl(image, thumbnail);
}
