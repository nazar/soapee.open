import React from 'react';
import { Header, Message } from 'semantic-ui-react';

import RecipeList from 'components/shared/RecipeList';
import { recentRecipes } from 'components/shared/RecipeOrderBar';

import myFavouriteRecipesQuery from '../queries/myFavouriteRecipes.gql';
import myFavouriteRecipesSummaryQuery from '../queries/myFavouriteRecipesSummary.gql';


export default function FavouriteRecipes() {
  const summaryQuery = {
    query: myFavouriteRecipesSummaryQuery,
    dataKey: 'myFavouriteRecipesSummary'
  };

  const itemsQuery = {
    query: myFavouriteRecipesQuery,
    dataKey: 'myFavouriteRecipes'
  };

  return (
    <div className="profile-favourite-recipes">
      <Header as="h2">My Favourite Recipes</Header>

      <RecipeList
        withSearch
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
        <Message.Header>No Favourite Recipes</Message.Header>
        Click on the <strong>Favourite</strong> button when viewing Recipes to add them to your Favourite Recipes.
      </Message.Content>
    </Message>
  );
}
