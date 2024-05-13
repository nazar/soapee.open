import './commands';

// name the graphQL endpoint so that we can intercept further in a command
beforeEach(() => {
  cy
    .intercept('POST', '/api/graphql')
    .as('graphqlRequest');
});
