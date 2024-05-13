import _ from 'lodash';
import Bluebird from 'bluebird';
import bcrypt from 'bcrypt';
import * as yup from 'yup';
import { transaction } from 'objection';

import User from 'models/user';
import Verification from 'models/verification';

import { sendEmail } from 'services/email';
import { createTokenForUser } from 'services/security';
import { UserInputError } from 'services/errors';

import newUser from 'schemas/services/feed/newUser';

export default async function localSignup({ username, email, password }) {
  let user;
  let verification;
  let token;

  await validateInputs();

  const trx = await transaction.start(User.knex());

  return Bluebird
    .resolve(checkUsernameDoesntExist())
    .then(checkEmailDoesntExist)
    .then(createUser)
    .then(createVerification)
    .then(addNewUserToFeed)
    .then(() => (token = createTokenForUser(user, verification)))
    .tapCatch(() => trx.rollback())
    .then(() => trx.commit())
    .then(emailUserCredentialsIfEmailProvided)
    .then(() => ({
      user,
      token
    }));

  // implementation details

  function checkUsernameDoesntExist() {
    return Verification
      .query(trx)
      .count('id')
      .findOne({
        providerId: username,
        providerName: 'local'
      })
      .then(({ count }) => {
        if (count > 0) {
          throw new UserInputError('Username is taken', { code: 'username_taken' });
        }
      });
  }

  function checkEmailDoesntExist() {
    if ((email || '').length > 0) {
      return User
        .query(trx)
        .findOne({ email })
        .then((emailUser) => {
          if (!(_.isEmpty(emailUser))) {
            return emailUser
              .$relatedQuery('verifications', trx)
              .then((verifications) => {
                const providers = _.chain(verifications)
                  .filter(({ providerName }) => providerName !== 'local')
                  .map('providerName')
                  .value();

                throw new UserInputError('Email is taken', { code: 'email_taken', providers });
              });
          }
        });
    }
  }

  function createUser() {
    return User.query(trx)
      .insert({
        name: username,
        email,
        lastLoggedIn: new Date()
      })
      .then(res => (user = res));
  }

  function createVerification() {
    return createHash().then(hash =>
      Verification.query(trx)
        .insert({
          userId: user.id,
          providerId: username,
          providerName: 'local',
          hash
        })
        .returning('*')
        .then(res => (verification = res))
    );

    //

    function createHash() {
      return Bluebird.promisify(bcrypt.genSalt)(10).then(salt =>
        Bluebird.promisify(bcrypt.hash)(password, salt)
      );
    }
  }

  function addNewUserToFeed() {
    return newUser({ user, trx });
  }

  function validateInputs() {
    const schema = yup.object().shape({
      username: yup
        .string()
        .min(3)
        .max(30)
        .matches(/^[a-zA-Z0-9_/-]*$/, { excludeEmptyString: true })
        .required(),

      email: yup.string().email(),

      password: yup
        .string()
        .min(3)
        .max(30)
        .required()
    });

    return schema.validate({
      username,
      email,
      password
    });
  }

  function emailUserCredentialsIfEmailProvided() {
    const body = _.template(credentialDetailsEmail)({
      username, password
    });

    if (email) {
      return sendEmail({
        to: email,
        subject: 'SOAPEE.COM - Registration Details',
        body
      });
    }
  }
}

const credentialDetailsEmail = `
Thank you for signing up and welcome to http://soapee.com

Please keep this email safe as it contains your registration username and password.

Your login details are:

  username: <%= username %>
  password: <%= password %>

Please do not reply to this email address as this is an automated email.

Check out Soapee's forums for more information and for help.
`;
