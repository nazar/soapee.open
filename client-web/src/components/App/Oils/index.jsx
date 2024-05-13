import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import List from 'components/App/Oils/List';
import View from 'components/App/Oils/View';

export default function Oils() {
  const { path } = useRouteMatch();

  return (
    <div className="oils">
      <Switch>
        <Route path={`${path}/:oilId`} component={View} />
        <Route path={path} component={List} />
      </Switch>
    </div>
  );
}
