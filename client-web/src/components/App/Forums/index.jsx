import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import Create from 'components/App/Forums/Create';
import Edit from 'components/App/Forums/Edit';
import List from 'components/App/Forums/List';
import Search from 'components/App/Forums/Search';
import View from 'components/App/Forums/View';

export default function Oils() {
  const { path } = useRouteMatch();

  return (
    <div className="forums">
      <Switch>
        <Route path={`${path}/create`}><Create /></Route>
        <Route path={`${path}/home`}><List /></Route>
        <Route path={`${path}/search`}><Search /></Route>

        <Route exact path={`${path}/:forumId`}><View /></Route>
        <Route path={`${path}/:forumId/edit`}><Edit /></Route>

        <Route exact path={`${path}`}><List /></Route>
      </Switch>
    </div>
  );
}
