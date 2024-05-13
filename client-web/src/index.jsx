import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { Router } from 'react-router-dom';

import client from 'client';
import App from 'components/App';
import SentryErrorBoundary from 'components/shared/SentryErrorBoundary';


// import third party component styles
import 'semantic-ui-css/semantic.min.css';
import 'rc-slider/assets/index.css';
import 'emoji-mart/css/emoji-mart.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'cropperjs/dist/cropper.css'; // cropperjs is a depenency of react-cropper

// global stylus file
import './styles/global/index.styl';
import history from './routeHistory';

// cypress visit does a full page reload - use window.hist to simulate SPA navigation
if (window.Cypress) {
  window.hist = history;
}

ReactDOM.render(
  <ApolloProvider client={client}>
    <SentryErrorBoundary>
      <Router history={history}>
        <App />
      </Router>
    </SentryErrorBoundary>
  </ApolloProvider>,
  document.getElementById('root')
);
