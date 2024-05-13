import request from 'supertest';
import { expect } from 'chai';

import app from 'app';
import responseHandler from 'test/utils/graphql';
import knex from 'test/utils/knex';
import getToken from 'test/utils/getToken';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Mutation', () => {

  beforeEach(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('User', () => {

    describe('localSignup', () => {
      it('Should be able to signup using username and password', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
            mutation {
              localSignup(
                username: "username",
                password: "password",
                email:"email@email.com"
              ) {
                token 
                
                user {
                  id
                  name
                  email
                  lastLoggedIn
                }
              }
            }
          `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { localSignup } } } = res;

            expect(localSignup.user).to.exist;
            expect(localSignup.token).to.exist;

            expect(localSignup.user.name).to.equal('username');
            expect(localSignup.user.email).to.equal('email@email.com');
            expect(localSignup.user.lastLoggedIn).to.be.ok;
          }));
      });
    });


    describe('localUserLogin', () => {
      it('Should login using username and password', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
            mutation {
              localUserLogin(
                username: "nazar",
                password: "password"
              ) {
                token
                user {
                  id
                }
              }
            }
          `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { localUserLogin } } } = res;

            expect(res.body.errors).to.be.undefined;

            expect(localUserLogin.token).to.be.ok;
            expect(localUserLogin.user).to.be.ok;
            expect(localUserLogin.user.id).to.be.ok;
          }));
      });
    });

    describe('updateMe', () => {
      let token;

      beforeEach(() => getToken({
        username: 'nazar',
        password: 'password'
      }).then(res => (token = res)));

      it('Should update mme', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                updateMe(
                  input: {
                  name: "teh name"
                  about: "teh about",
                  email: "valid@email.com",
                  imageUrl: "url"
                }) {
                  name
                  about
                  email
                  imageUrl
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { updateMe } } } = res;

            expect(updateMe.name).to.equal('teh name');
            expect(updateMe.about).to.equal('teh about');
            expect(updateMe.email).to.equal('valid@email.com');
            expect(updateMe.imageUrl).to.equal('url');
          }));
      });
    });

    describe('makeFriendLink', () => {
      let token;
      let targetFriend;

      beforeEach(() => getToken({
        username: 'nazar',
        password: 'password'
      }).then(res => (token = res)));

      beforeEach(() => knex('users')
        .where({ name: 'Stranger Danger' })
        .first()
        .then(res => (targetFriend = res))
      );

      it('Should accept a friend request', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                makeFriendLink(
                  toUserId: ${targetFriend.id}
                ) {
                  id
                  userId
                  friendId
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { makeFriendLink } } } = res;

            expect(makeFriendLink.id).to.be.ok;
            expect(makeFriendLink.userId).to.be.ok;
            expect(makeFriendLink.friendId).to.equal(String(targetFriend.id));
          }));
      });
    });

    describe('removeFriendLink', () => {
      let token;
      let targetFriend;

      beforeEach(() => getToken({
        username: 'nazar',
        password: 'password'
      }).then(res => (token = res)));

      beforeEach(() => knex('users')
        .where({ name: 'Aziz Nazar' })
        .first()
        .then(res => (targetFriend = res))
      );

      it('Should remove a friend', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                removeFriendLink(
                  toUserId: ${targetFriend.id}
                ) {
                  id
                  userId
                  friendId
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { removeFriendLink } } } = res;

            expect(removeFriendLink.id).to.be.ok;
            expect(removeFriendLink.userId).to.be.ok;
            expect(removeFriendLink.friendId).to.equal(String(targetFriend.id));
          }));
      });
    });
  });
});
