import _ from 'lodash';
import request from 'supertest';
import { expect } from 'chai';

import app from 'app';
import getToken from 'test/utils/getToken';
import responseHandler from 'test/utils/graphql';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';


describe('Query', () => {

  before(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('User', () => {
    let token;

    before(() => {
      return getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t));
    });


    describe('User Associations - has friends', () => {

      describe('Friends', () => {

        it('Should return my confirmed friends', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
                query {
                  myFriends {
                    name
                  }
                }
              `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { myFriends } } } = res;

              expect(myFriends.length).to.equal(1);
              expect(myFriends[0].name).to.equal('Aziz Nazar');
            }));
        });

        it('Should return my friends non private recipes', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
                query {
                  myFriendsRecipes {
                    name
                  }
                }
              `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { myFriendsRecipes } } } = res;

              expect(myFriendsRecipes.length).to.equal(1);
              expect(myFriendsRecipes[0].name).to.equal('Trial Remedial Recipe 2');
            }));
        });

      });
    });

    describe('User Associations - Billy no mates', () => {
      let tokenStranger;

      before(() => {
        return getToken({
          username: 'stranger',
          password: 'password'
        }).then(t => (tokenStranger = t));
      });

      describe('Friends', () => {
        it('Should return my confirmed friends', () => {
          return request(app)
            .post('/api/graphql')
            .set(tokenStranger)
            .send({
              query: `
                query {
                  myFriends {
                    name
                  }
                }
              `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { myFriends } } } = res;

              expect(myFriends).to.be.empty;
            }));
        });
      });
    });

    describe('validUsername', () => {

      it('Should return true if a username isn\'t taken', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
            query {
              validUsername(username: "stranger222") 
            }
          `
          })
          .then((res) => {
            const { body: { data: { validUsername } } } = res;

            expect(validUsername).to.be.true;
          });
      });

      it('Should return false if a username is taken', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
            query {
              validUsername(username: "nazar") 
            }
          `
          })
          .then((res) => {
            const { body: { data: { validUsername } } } = res;

            expect(validUsername).to.be.false;
          });
      });
    });

    describe('myComments', () => {
      it('Should return my comments', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myComments {
                  comment
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myComments } } } = res;

            expect(myComments.length).to.equal(2);
          }));
      });
    });

    describe('myRecipes', () => {
      it('Should return my recipes', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myRecipes {
                  name
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myRecipes } } } = res;

            expect(myRecipes.length).to.equal(3);
          }));
      });
    });

    describe('myFriends', () => {

      it('should return my friends', () => {

        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myFriends {
                  name
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myFriends } } } = res;

            expect(myFriends.length).to.equal(1);
            expect(myFriends[0].name).to.equal('Aziz Nazar');
          }));
      });

    });

    describe('myIncomingPendingFriends', () => {

      it('should return my incoming friend requests', () => {

        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myIncomingPendingFriends {
                  name
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myIncomingPendingFriends } } } = res;

            expect(myIncomingPendingFriends.length).to.equal(1);
            expect(myIncomingPendingFriends[0].name).to.equal('Stranger Danger');
          }));
      });

    });

    describe('myFriendsRecipes', () => {

      it('should return my friends recipes', () => {

        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myFriendsRecipes {
                  name
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myFriendsRecipes } } } = res;

            // recipe spec 4 is a friends recipe - visible
            // recipe spec 5 is a strangers friend recipe - not visible
            // recipe spec 6 is a friends private recipe - not visible

            expect(myFriendsRecipes.length).to.equal(1);
            // spec recipe 5
            expect(_.find(myFriendsRecipes, { name: 'Random Recipe 1' })).to.be.undefined;
            // spec recipe 6
            expect(_.find(myFriendsRecipes, { name: 'Private Recipe' })).to.be.undefined;
          }));
      });

    });

    describe('myFavouriteRecipes', () => {
      it('should return my favourite recipes', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              query {
                myFavouriteRecipes {
                  name
                } 
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { myFavouriteRecipes } } } = res;

            // recipe specs 1,2 and 3 are mine - visible
            // recipe spec 4 is a friends recipe - visible
            // recipe spec 5 is a strangers friend recipe - not visible
            // recipe spec 6 is a friends private recipe - not visible

            expect(myFavouriteRecipes.length).to.equal(4);
            // spec recipe 5
            expect(_.find(myFavouriteRecipes, { name: 'Random Recipe 1' })).to.be.undefined;
            // spec recipe 6
            expect(_.find(myFavouriteRecipes, { name: 'Private Recipe' })).to.be.undefined;
          }));
      });
    });
  });
});
