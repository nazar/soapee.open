import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';
import { Route, Switch, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import qs from 'qs';

import client from 'client';

import SoapCalculator from 'components/shared/SoapCalculator';
import Section from 'components/shared/Section';
import PrintTheRecipe from 'components/shared/PrintTheRecipe';

import recipeQuery from './queries/recipe.gql';
import createRecipeMutation from './queries/createRecipe.gql';

export default function Copy({ oils }) {
  const history = useHistory();
  const { recipeId } = useParams();
  const { path, url } = useRouteMatch();

  const { loading, data: { recipe } = {} } = useQuery(recipeQuery, {
    variables: { id: recipeId }
  });

  return (
    <div className="recipe-edit">
      <Helmet
        title="Copy Recipe - Soapee"
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
                  recipe={recipe}
                  oils={oils}
                  saveAction="Copy"
                  onSave={copyTheRecipe}
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

  function copyTheRecipe(copiedRecipe) {
    const payload = {
      ...copiedRecipe,
      fromRecipeId: recipeId
    };

    return client
      .mutate({
        mutation: createRecipeMutation,
        variables: {
          recipe: payload
        }
      })
      .then(({ data: { createRecipe } }) => history.push(`/recipes/${createRecipe.id}`));
  }
}

Copy.propTypes = {
  oils: PropTypes.array.isRequired
};
