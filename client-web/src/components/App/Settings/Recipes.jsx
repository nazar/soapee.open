import React from 'react';
import { Header, Message } from 'semantic-ui-react';

import RecipeList from 'components/shared/RecipeList';
import { recentRecipes } from 'components/shared/RecipeOrderBar';

import myRecipesQuery from './queries/myRecipes.gql';
import myRecipesSummaryQuery from './queries/myRecipesSummary.gql';


export default function Recipes() {
  const variables = {};

  const summaryQuery = {
    variables,
    query: myRecipesSummaryQuery,
    dataKey: 'myRecipesSummary'
  };

  const itemsQuery = {
    variables,
    query: myRecipesQuery,
    dataKey: 'myRecipes'
  };

  return (
    <div className="profile-recipes">
      <Header as="h2">My Recipes</Header>

      <RecipeList
        canDelete
        withSearch
        variables={variables}
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        recipeDefaultOrder={recentRecipes}
        NotFoundMessage={NoRecipesYet}
      />
    </div>
  );
}

function NoRecipesYet() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>No Recipes</Message.Header>
        Create Recipes to view them here
      </Message.Content>
    </Message>
  );
}
