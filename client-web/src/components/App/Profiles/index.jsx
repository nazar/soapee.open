import React from 'react';
import { Route, Switch, Redirect, useRouteMatch } from 'react-router-dom';

import View from './View';

export default function Oils() {
  const { path } = useRouteMatch();

  return (
    <div className="oils">
      <Switch>
        <Route path={`${path}/:profileId`}><View /></Route>
        <Route strict exact path={path}><Redirect to="/" /></Route>
      </Switch>
    </div>
  );
}
