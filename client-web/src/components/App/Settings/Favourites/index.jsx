import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import Comments from './Comments';
import Posts from './Posts';
import Recipes from './Recipes';

export default function Favourites() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/comments`}><Comments /></Route>
      <Route path={`${path}/posts`}><Posts /></Route>
      <Route path={`${path}/recipes`}><Recipes /></Route>
    </Switch>
  );
}
