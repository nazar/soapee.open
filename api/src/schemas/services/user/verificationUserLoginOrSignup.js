import _ from 'lodash';
import Bluebird from 'bluebird';
import axios from 'axios';
import { transaction } from 'objection';

import User from 'models/user';
import Verification from 'models/verification';

import { createTokenForUser } from 'services/security';
import newUser from 'schemas/services/feed/newUser';

export default function verificationUserLoginOrSignup({ provider, token, rememberMe }) {
  let userDetails;
  let user;
  let verification;
  let ourToken;

  return getUserDetailsFromProvider()
    .then(findOrCreateVerification)
    .then(() => (ourToken = createTokenForUser(user, verification, rememberMe)))
    .then(() => ({
      user,
      token: ourToken
    }));

  // implementation

  function getUserDetailsFromProvider() {
    const lookup = {
      facebook: facebookDataRequester,
      google: googleDataRequester
    }[provider];

    return lookup()
      .then(res => (userDetails = res));

    //

    function facebookDataRequester() {
      return axios
        .get('https://graph.facebook.com/me', {
          params: {
            access_token: token,
            fields: 'id,name,email'
          }
        })
        .then(res => res.data)
        .then(data => ({
          id: data.id,
          name: data.name,
          email: data.email,
          imageUrl: `https://graph.facebook.com/${data.id}/picture`
        }));
    }

    function googleDataRequester() {
      return axios
        .get('https://oauth2.googleapis.com/tokeninfo', {
          params: {
            id_token: token
          }
        })
        .then(res => res.data)
        .then(data => ({
          id: data.sub,
          email: data.email,
          name: data.name,
          imageUrl: data.picture
        }));
    }
  }

  function findOrCreateVerification() {
    return Verification
      .query()
      .where({
        providerId: userDetails.id,
        providerName: provider
      })
      .limit(1)
      .first()
      .then(async (res) => {
        if (_.isEmpty(res)) {
          const trx = await transaction.start(User.knex());

          // this is a signup - create both this and User entries
          return Bluebird
            .resolve(
              User
                .query(trx)
                .insert({
                  name: userDetails.name,
                  email: userDetails.email,
                  imageUrl: userDetails.imageUrl,
                  lastLoggedIn: new Date()
                })
                .returning('*')
            )
            .then((dbUser) => {
              user = dbUser;

              return Verification
                .query(trx)
                .insert({
                  userId: dbUser.id,
                  providerId: userDetails.id,
                  providerName: provider
                })
                .returning('*')
                .then(v => (verification = v));
            })
            .then(() => newUser({ user, trx }))
            .tapCatch(() => trx.rollback())
            .then(() => trx.commit());
        } else {
          verification = res;

          return res
            .$relatedQuery('user')
            .then((dbUser) => {
              return User
                .query()
                .patch({
                  LastLoggedIn: new Date(),
                  email: userDetails.email,
                  imageUrl: userDetails.imageUrl
                })
                .where({
                  id: dbUser.id
                })
                .returning('*')
                .first()
                .then(updated => (user = updated));
            });
        }
      });
  }
}
