import config from 'config';
import jwt from 'jsonwebtoken';

import { getAuthTokenFromReq } from 'services/security';

export default async function token(req, res, next) {
  const authToken = getAuthTokenFromReq(req);

  if (authToken) {
    try {
      const verified = await jwt.verify(authToken, config.get('jwt.secret'));

      if (verified) {
        req.authToken = authToken;
        req.tokenPayload = await jwt.decode(authToken, { json: true });
      }
    } catch (e) {
      // noop
    }
  }

  next();
}
