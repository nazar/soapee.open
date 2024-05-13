import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import PublicList from 'components/App/Feed/PublicList';

export default function Feed() {
  const { path } = useRouteMatch();

  return (
    <div className="feed">
      <Switch>
        <Route strict exact path={path}><PublicList /></Route>
      </Switch>
    </div>
  );
}
