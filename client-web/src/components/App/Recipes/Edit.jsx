import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container } from 'semantic-ui-react';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import qs from 'qs';

import client from 'client';

import SoapCalculator from 'components/shared/SoapCalculator';
import Section from 'components/shared/Section';
import PrintTheRecipe from 'components/shared/PrintTheRecipe';

import recipeQuery from './queries/recipe.gql';
import createRecipeMutation from './queries/createRecipe.gql';
import updateRecipeMutation from './queries/updateRecipe.gql';


export default function Edit({ oils }) {
  const history = useHistory();
  const { recipeId } = useParams();
  const { path, url } = useRouteMatch();

  const { loading, data: { recipe } = {} } = useQuery(recipeQuery, {
    variables: { id: recipeId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'standby'
  });

  return (
    <div className="recipe-edit">
      <Helmet
        title="Edit Recipe - Soapee"
      />

      <Switch>
        <Route path={`${path}/print`}>
          <PrintTheRecipe recipe={recipe} oils={oils} />
        </Route>

        <Route>
          <Section loading={loading}>
            {recipe && (
              <Container className="view-page">
                <SoapCalculator
                  canSaveAsCopy
                  oils={oils}
                  recipe={recipe}
                  onSave={updateTheRecipe}
                  onSaveAsCopy={createTheRecipe}
                  onPrint={handlePrint}
                />
              </Container>
            )}
          </Section>
        </Route>
      </Switch>
    </div>
  );

  //

  function handlePrint(calcRecipe, printOptions) {
    history.push(`${url}/print${qs.stringify(printOptions, { addQueryPrefix: true })}`);
  }

  function updateTheRecipe(updatedRecipe) {
    return client
      .mutate({
        mutation: updateRecipeMutation,
        variables: {
          id: recipeId,
          recipe: updatedRecipe
        }
      })
      .then(() => history.push(`/recipes/${recipeId}`));
  }

  function createTheRecipe(saveAsRecipe) {
    return client
      .mutate({
        mutation: createRecipeMutation,
        variables: {
          recipe: saveAsRecipe
        }
      })
      .then(({ data: { createRecipe } }) => history.push(`/recipes/${createRecipe.id}`));
  }
}

Edit.propTypes = {
  oils: PropTypes.array.isRequired
};
