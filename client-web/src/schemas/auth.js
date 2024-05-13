import { isLoggedIn } from 'services/token';

export const authTypeDefs = ` 
  extend type Query {
    authenticated: Boolean!
  }

  extend type Mutation {
    setAuthenticated(authenticated: Boolean!): Boolean!
  }
`;

export const authResolvers = {
  Mutation: {
    setAuthenticated: (__, { authenticated }, { cache }) => {
      cache.writeData({ data: { authenticated } });
      return authenticated;
    }
  }
};

export function authDefaults(cache) {
  cache.writeData({
    data: {
      authenticated: isLoggedIn()
    }
  });
}
