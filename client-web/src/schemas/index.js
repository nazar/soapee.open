import _ from 'lodash';

import { authTypeDefs, authResolvers, authDefaults } from 'schemas/auth';

// define base types here so that we can include Query, Mutation and Subscription
// in each typeDef file
const Query = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = `
  ${Query}
  ${authTypeDefs}
`;

export const resolvers = _.merge({},
  authResolvers
);

export function loadDefaults(cache) {
  authDefaults(cache);
}
