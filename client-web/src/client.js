import _ from 'lodash';
import { ApolloClient } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';

import { getAuthHeader } from 'services/token';

import { cache } from 'cache';

const authLink = setContext((__, { headers }) => ({
  headers: _.merge({}, headers, getAuthHeader())
}));

const httpLink = createUploadLink({
  uri: '/api/graphql'
});

export default new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  assumeImmutableResults: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-only'
    }
  }
});
