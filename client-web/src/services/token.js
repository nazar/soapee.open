import jwtDecode from 'jwt-decode';
import cookies from 'js-cookie';
import { subHours, isAfter } from 'date-fns';


const tokenName = 'soapee-token';

export function setToken(token) {
  const exp = getField(token, 'exp');
  const rememberMe = getField(token, 'rememberMe');
  const attributes = rememberMe ? { expires: new Date(exp * 1000) } : undefined;

  cookies.set(tokenName, token, attributes);
}

export function clearAuthToken() {
  cookies.remove(tokenName);
}

export function getAuthHeader() {
  const token = getToken();

  if (token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }
}

export function isLoggedIn() {
  return ((getToken() && !isExpired()) === true);
}

export function tokenAboutToExpire() {
  if (isLoggedIn()) {
    const token = getToken();
    const expiresAtSeconds = getField(token, 'exp');
    const expiresAtDate = new Date(expiresAtSeconds * 1000);
    const expiryCutoffDate = subHours(expiresAtDate, 24);

    return isAfter(new Date(), expiryCutoffDate);
  }
}

export function getToken() {
  return cookies.get(tokenName);
}

export function isLocalUser() {
  const token = getToken();

  return getField(token, 'providerName') === 'local';
}

// private


function isExpired() {
  const exp = getField(getToken(), 'exp');

  return exp ? exp * 1000 < Date.now() : true;
}

function getField(token, field) {
  if (token) {
    try {
      return jwtDecode(token)[field];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Could not decode JWT token.', e);
      return null;
    }
  }
}
