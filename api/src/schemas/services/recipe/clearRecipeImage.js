import clearImageable from '../image/clearImageable';

export default function clearRecipeImage({ recipe, trx }) {
  return clearImageable({ imageableId: recipe.id, imageableType: 'recipes', trx });
}
