import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Breadcrumb, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import RecipeList from 'components/shared/RecipeList';
import useCurrentUser from 'hooks/useCurrentUser';

import recipesSummaryQuery from 'queries/recipe/recipesSummary.gql';

import recipesQuery from './recipes.gql';

export default function List() {
  const summaryQuery = {
    query: recipesSummaryQuery,
    dataKey: 'recipesSummary'
  };

  const itemsQuery = {
    query: recipesQuery,
    dataKey: 'recipes'
  };

  const currentUser = useCurrentUser();

  return (
    <Container className="view-page">
      <Helmet
        title="Soaping Recipes - Soapee"
      />

      <Bread />

      <RecipeList
        withSearch
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
        isAdmin={currentUser?.isAdmin}
      />
    </Container>
  );
}

function Bread() {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Public Recipes</Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}
