import _ from 'lodash';
import config from 'config';
import jwt from 'jsonwebtoken';

import Verification from 'models/verification';
import { createTokenForUser } from 'services/security';

export default async function renewToken({ token, user }) {
  const verified = await jwt.verify(token, config.get('jwt.secret'));

  if (verified) {
    if (String(user.id) === String(verified.userId)) {
      return Verification
        .query()
        .findOne({
          userId: verified.userId,
          providerName: verified.providerName
        })
        .then((verification) => {
          if (_.isEmpty(verification)) {
            throw new Error('invalid user', {
              user,
              verified,
              verification
            });
          } else {
            return createTokenForUser(user, verification);
          }
        });
    } else {
      throw new Error('Invalid Token');
    }
  }
}
