import React from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Container, Header, Segment } from 'semantic-ui-react';

import Home from 'components/App/Home';
import Auth from 'components/App/Auth';
import Calculator from 'components/App/Calculator';
import DeleteAccount from 'components/App/DeleteAccount';
import Feed from 'components/App/Feed';
import Forum from 'components/App/Forums';
import Oils from 'components/App/Oils';
import Posts from 'components/App/Posts';
import Privacy from 'components/App/Privacy';
import Profiles from 'components/App/Profiles';
import Recipes from 'components/App/Recipes';
import Settings from 'components/App/Settings';
import PageNotFound from 'components/App/PageNotFound';

import useCurrentUser from 'hooks/useCurrentUser';
import useGaRouteLogging from 'hooks/useGaRouteLogging';
import useCookieExpiredCheck from 'hooks/useCookieExpiredCheck';

import Footer from './components/Footer';
import NavBar from './components/NavBar';

import './App.styl';

export default function App() {
  useGaRouteLogging();
  useCookieExpiredCheck();
  useCurrentUser(false);

  return (
    <div id="root-app">
      <Helmet
        title="Soapee"
      />

      <NavBar />
      <ShuttingDown />

      <div className="App">
        <Switch>
          <Route path="/auth"><Auth /></Route>
          <Route path="/calculator"><Calculator /></Route>
          <Route path="/delete-account"><DeleteAccount /></Route>
          <Route path="/feed"><Feed /></Route>
          <Route path="/forums"><Forum /></Route>
          <Route path="/oils"><Oils /></Route>
          <Route path="/posts"><Posts /></Route>
          <Route path="/privacy"><Privacy /></Route>
          <Route path="/profiles"><Profiles /></Route>
          <Route path="/recipes"><Recipes /></Route>
          <Route path="/settings"><Settings /></Route>
          <Route exact path="/"><Home /></Route>

          <Route><PageNotFound /></Route>
        </Switch>
      </div>

      <Footer />
    </div>
  );
}

function ShuttingDown() {
  return (
    <Container className="notification">
      <Segment>
        <Header as="h2" textAlign="center" color="red">
          Soapee is <Link to="/posts/78">shutting down</Link> after the 30th of April 2024
        </Header>
      </Segment>
    </Container>
  );
}
