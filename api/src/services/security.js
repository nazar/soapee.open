import _ from 'lodash';
import config from 'config';
import jwt from 'jsonwebtoken';

import { ForbiddenError } from 'services/errors';

export function getAuthTokenFromReq(req) {
  const auth = _.get(req, 'headers.authorization');

  if (auth) {
    const [scheme, credentials] = auth.split(' ');

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }
}

export function createTokenForUser(user, verification, rememberMe) {
  const expiresIn = rememberMe ? '30d' : '48h';

  return jwt.sign({
    userId: user.id,
    providerName: verification.providerName,
    rememberMe: rememberMe ? true : undefined
  },
  config.get('jwt.secret'),
  { expiresIn });
}

export function objectOwnerCheck(object, user) {
  if (!(_.has(object, 'userId'))) {
    throw new Error('object does not have a userId property');
  }

  if (Number(user.id) !== Number(object.userId)) {
    throw new ForbiddenError('Cannot update an object you do not own');
  }
}
