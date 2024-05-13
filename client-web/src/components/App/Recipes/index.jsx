import _ from 'lodash';
import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import useOils from 'hooks/useOils';

import Section from 'components/shared/Section';

import Copy from 'components/App/Recipes/Copy';
import Edit from 'components/App/Recipes/Edit';
import List from 'components/App/Recipes/List';
import Print from 'components/App/Recipes/Print';
import View from 'components/App/Recipes/View';

export default function Recipes() {
  const { path } = useRouteMatch();
  const [oils, loading] = useOils();

  return (
    <div className="recipes">
      <Section loading={loading}>
        {!(_.isEmpty(oils)) && (
          <Switch>
            <Route path={`${path}/:recipeId/copy`}><Copy oils={oils} /></Route>
            <Route path={`${path}/:recipeId/edit`}><Edit oils={oils} /></Route>
            <Route path={`${path}/:recipeId/print`}><Print oils={oils} /></Route>
            <Route path={`${path}/:recipeId`}><View oils={oils} /></Route>
            <Route strict exact path={path}><List /></Route>
          </Switch>
        )}
      </Section>
    </div>
  );
}
