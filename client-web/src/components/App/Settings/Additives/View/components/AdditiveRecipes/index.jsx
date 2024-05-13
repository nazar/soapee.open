import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import { useCreation } from 'ahooks';

import useCurrentUser from 'hooks/useCurrentUser';
import RecipeList from 'components/shared/RecipeList';

import myAdditiveRecipesQuery from './queries/myAdditiveRecipes.gql';
import myAdditivesRecipesSummaryQuery from './queries/myAdditivesRecipesSummary.gql';

export default function AdditiveRecipes({ additive }) {
  const [variables, summaryQuery, itemsQuery] = useCreation(() => ([
    {
      search: { additiveId: additive.id }
    },
    {
      query: myAdditivesRecipesSummaryQuery,
      dataKey: 'myRecipesSummary'
    },
    {
      query: myAdditiveRecipesQuery,
      dataKey: 'myRecipes'
    }
  ]), [additive]);

  const currentUser = useCurrentUser();

  return (
    <div className="additive-recipes-component" data-cy="additive-recipes">
      <RecipeList
        variables={variables}
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        isAdmin={currentUser?.isAdmin}
        NotFoundMessage={NoAdditiveRecipesMessage}
      />
    </div>
  );
}

AdditiveRecipes.propTypes = {
  additive: PropTypes.object.isRequired
};

function NoAdditiveRecipesMessage() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>Additive not used</Message.Header>
        This additive is not used in any of your recipes
      </Message.Content>
    </Message>
  );
}
