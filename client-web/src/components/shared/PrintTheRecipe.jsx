import React from 'react';
import { useHistory } from 'react-router-dom';

import usePrint from 'hooks/usePrint';
import RecipePrint from 'components/shared/RecipeComponents/RecipePrint';

export default function PrintTheRecipe({ recipe, oils }) {
  const history = useHistory();

  usePrint({ recipe });

  if (recipe) {
    return <RecipePrint recipe={recipe} oils={oils} />;
  } else {
    history.back();
    return null;
  }
}
