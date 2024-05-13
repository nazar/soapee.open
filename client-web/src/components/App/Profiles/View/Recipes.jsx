import React from 'react';
import { Message } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';

import RecipeList from 'components/shared/RecipeList';

import recipesQuery from 'queries/recipe/recipes.gql';
import recipesSummaryQuery from 'queries/recipe/recipesSummary.gql';

export default function Recipes() {
  const { profileId } = useParams();

  const variables = {
    search: {
      userId: profileId
    }
  };

  const summaryQuery = {
    variables,
    query: recipesSummaryQuery,
    dataKey: 'recipesSummary'
  };

  const itemsQuery = {
    variables,
    query: recipesQuery,
    dataKey: 'recipes'
  };

  return (
    <div className="profile-recipes">
      <RecipeList
        variables={variables}
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        NotFoundMessage={NoRecipesYet}
      />
    </div>
  );
}

function NoRecipesYet() {
  return (
    <Message
      icon="book"
      header="No Results"
      content="I haven't made any recipes yet."
    />
  );
}
