import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import AdditiveCreate from './Create';
import AdditivesList from './List';
import AdditivesView from './View';

export default function Additives() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/create`}><AdditiveCreate /></Route>
      <Route path={`${path}/:additiveId`}><AdditivesView /></Route>
      <Route path={`${path}`}><AdditivesList /></Route>
    </Switch>
  );
}
