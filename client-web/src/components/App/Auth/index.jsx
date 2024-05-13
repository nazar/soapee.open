import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Container, Grid } from 'semantic-ui-react';

import useCurrentUser from 'hooks/useCurrentUser';

import Login from 'components/App/Auth/Login';
import Signup from 'components/App/Auth/Signup';
import Facebook from 'components/App/Auth/Facebook';
import Forgot from 'components/App/Auth/Forgot';

import './style.styl';

export default function Auth() {
  const { path } = useRouteMatch();
  const currentUser = useCurrentUser();

  if (currentUser) {
    return <Redirect to="/settings" />;
  }

  return (
    <div id="root-auth" className="auth">
      <Container text textAlign="center">
        <Grid textAlign="center" verticalAlign="middle" className="grid-container">
          <Grid.Column className="grid-column">
            <Switch>
              <Route path={`${path}/login`} component={Login} />
              <Route path={`${path}/signup`} component={Signup} />
            </Switch>
          </Grid.Column>
        </Grid>
      </Container>

      <Container>
        <Switch>
          <Route path={`${path}/forgot`} component={Forgot} />
          <Route path={`${path}/facebook-recover`} component={Facebook} />
        </Switch>
      </Container>
    </div>
  );
}
