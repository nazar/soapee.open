import React from 'react';
import { Header, Message } from 'semantic-ui-react';

import RecipeList from 'components/shared/RecipeList';
import { recentRecipes } from 'components/shared/RecipeOrderBar';
import useCurrentUser from 'hooks/useCurrentUser';

import myFriendsRecipesQuery from './queries/myFriendsRecipes.gql';
import myFriendsRecipesSummaryQuery from './queries/myFriendsRecipesSummary.gql';


export default function Recipes() {
  const currentUser = useCurrentUser();

  if (currentUser) {
    const itemsQuery = {
      query: myFriendsRecipesQuery,
      dataKey: 'myFriendsRecipes'
    };

    const summaryQuery = {
      query: myFriendsRecipesSummaryQuery,
      dataKey: 'myFriendsRecipesSummary'
    };

    return (
      <div className="profile-recipes">
        <Header as="h2">My Friend&apos;s Recipes</Header>

        <RecipeList
          withSearch
          summaryQuery={summaryQuery}
          itemsQuery={itemsQuery}
          recipeDefaultOrder={recentRecipes}
          NotFoundMessage={NoRecipesYet}
        />
      </div>
    );
  } else {
    return null;
  }
}

function NoRecipesYet() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>No Recipes</Message.Header>
        Add Friends with Recipes to view their shared recipes here.
      </Message.Content>
    </Message>
  );
}
