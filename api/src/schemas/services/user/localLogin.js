import _ from 'lodash';
import Bluebird from 'bluebird';
import bcrypt from 'bcrypt';
import * as yup from 'yup';

import User from 'models/user';
import Verification from 'models/verification';

import { createTokenForUser } from 'services/security';
import { UserInputError } from 'services/errors';

export default async function localLogin({ username, password, rememberMe }) {
  let token;
  let verification;
  let user;

  await validateInputs();

  return getVerification()
    .then(checkPassword)
    .then(getUser)
    .then(() => (token = createTokenForUser(user, verification, rememberMe)))
    .then(updateLastLogin)
    .then(() => ({
      user,
      token
    }));

  // implementation details

  function getVerification() {
    return Bluebird.resolve(
      Verification
        .query()
        .findOne({
          providerId: username,
          providerName: 'local'
        })
    )
      .tap((res) => {
        if (_.isEmpty(res)) {
          throw new UserInputError('User not found', { code: 'user_not_found' });
        } else if (res.deletedAt) {
          throw new UserInputError('User was deleted', { code: 'user_was_deleted' });
        }
      })
      .then(res => (verification = res));
  }

  function getUser() {
    return verification
      .$relatedQuery('user')
      .then(dbUser => (user = dbUser));
  }

  function checkPassword() {
    return Bluebird.promisify(bcrypt.compare)(password, verification.hash)
      .then((matches) => {
        if (!(matches)) {
          throw new UserInputError('Wrong password', { code: 'wrong_password' });
        }
      });
  }

  function updateLastLogin() {
    return User
      .query()
      .patch({ lastLoggedIn: new Date() })
      .where({ id: user.id });
  }

  function validateInputs() {
    const schema = yup.object()
      .shape({
        username: yup
          .string()
          .min(3)
          .max(30)
          .matches(/^[a-zA-Z0-9_/-]*$/, { excludeEmptyString: true })
          .required(),

        password: yup
          .string()
          .min(3)
          .max(30)
          .required()
      });

    return schema.validate({
      username,
      password
    });
  }
}
