import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import EditPost from './Edit';
import View from './View';

export default function Posts() {
  const { path } = useRouteMatch();

  return (
    <div className="posts">
      <Switch>
        <Route path={`${path}/:postId/edit`}><EditPost /></Route>
        <Route path={`${path}/:postId`}><View /></Route>
      </Switch>
    </div>
  );
}
