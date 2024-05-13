import client from 'client';
import { authenticatedVar, hasMeVar } from 'cache';

import { getToken, setToken } from 'services/token';

import renewTokenMutation from './queries/renewToken.gql';
import verificationUserLoginOrSignupMutation from './queries/verificationUserLoginOrSignup.gql';


export function setAuthenticated() {
  return authenticatedVar(true);
}

export function resetAuthenticated() {
  hasMeVar(false);
  return authenticatedVar(false);
}

export function renewToken() {
  const token = getToken();

  return client
    .mutate({
      mutation: renewTokenMutation,
      variables: { token }
    })
    .then(({ data: { renewToken: renewedToken } }) => renewedToken)
    .then(newToken => setToken(newToken));
}

export function socialSigninProvider({ token, provider, rememberMe }) {
  return client
    .mutate({
      mutation: verificationUserLoginOrSignupMutation,
      variables: {
        provider,
        token,
        rememberMe
      }
    });
}
