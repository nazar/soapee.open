import _ from 'lodash';
import request from 'supertest';
import { expect } from 'chai';

import app from 'app';
import responseHandler from 'test/utils/graphql';
import getToken from 'test/utils/getToken';
import knex from 'test/utils/knex';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Mutation', () => {

  beforeEach(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Post', () => {

    let token;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    describe('createPost', () => {
      let testForum;

      beforeEach(() => knex('forums')
        .limit(1).then(res => ([testForum] = res)));

      it('Should create a post', () => {
        return createPostHelper(token, testForum.id)
          .then(res => responseHandler(res, () => {
            const { body: { data: { createPost } } } = res;

            expect(createPost.id).to.exist;
            expect(createPost.content).to.exist;
            expect(createPost.postableId).to.exist;
            expect(createPost.postableType).to.exist;
            expect(createPost.userId).to.exist;

            expect(createPost.postable).to.exist;
            expect(createPost.postable.name).to.be.ok;

            expect(createPost.user).to.exist;
            expect(createPost.user.name).to.be.ok;

            return knex('forums')
              .where({ id: testForum.id })
              .limit(1)
              .then((res2) => {
                [testForum] = res2;

                expect(testForum.stats).to.be.ok;
                expect(testForum.stats.posts.posts).to.equal(3);
              });
          }));
      });

      it('Should update a Post', () => {
        return knex('posts').where({ content: 'this is the post content' }).limit(1).first()
          .then((dbPost) => {
            return updatePostHelper(dbPost.id, token)
              .then(res => responseHandler(res, () => {
                const { body: { data: { updatePost } } } = res;

                expect(updatePost.id).to.exist;
                expect(updatePost.content).to.exist;
                expect(updatePost.postableId).to.exist;
                expect(updatePost.postableType).to.exist;
                expect(updatePost.userId).to.exist;

                expect(updatePost.postable).to.exist;
                expect(updatePost.postable.name).to.be.ok;

                expect(updatePost.user).to.exist;
                expect(updatePost.user.name).to.be.ok;
              }));
          });
      });
    });

    describe('createPost in locked forums', () => {
      let lockedForum;

      beforeEach(() => knex('forums').where({ id: 3 }).limit(1).then(([res]) => (lockedForum = res)));

      it('Should not create a post on a locked forum', () => {
        return createPostHelper(token, lockedForum.id)
          .then(({ body: { errors } }) => {
            expect(errors).to.be.ok;
            // eslint-disable-next-line max-len
            expect(_.chain(errors).map('message').join().value()).to.contain("Cannot create a post on this Forum as it is locked");
          });
      });
    });

    describe('lockPost', () => {
      let postToLock;

      beforeEach(() => knex('posts')
        .where({ content: 'this is the post content' })
        .limit(1)
        .then(res => ([postToLock] = res)));

      describe('Forum owner', () => {

        it('Should be able to lock posts', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
                mutation {
                  lockPost(id: ${postToLock.id}) {
                    id
                    locked
                    lockedAt
                    lockedByUserId
                  }
                }
              `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { lockPost } } } = res;

              expect(lockPost).to.be.ok;
              expect(lockPost.locked).to.equal(true);
              expect(lockPost.lockedAt).to.ok;
              expect(lockPost.lockedByUserId).to.ok;
            }));

        });
      });

      describe('Not forum owner', () => {

        beforeEach(() =>
          getToken({
            username: 'aziz',
            password: 'password'
          }).then(t => (token = t))
        );

        it('Should not be able to lock a post', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
                mutation {
                  lockPost(id: ${postToLock.id}) {
                    id
                    locked
                    lockedAt
                    lockedByUserId
                  }
                }
              `
            })
            .then((res) => {
              expect(res.body.errors.length).to.be.above(0);
              expect(res.body.errors[0].message).to.equal('Insufficient permissions for this operation');
            });
        });
      });
    });
  });

});

// helpers

function createPostHelper(token, forumId) {
  return request(app)
    .post('/api/graphql')
    .set(token)
    .send({
      query: `
        mutation {
          createPost(
            input: {
              postableId: ${forumId},
              postableType: forums,
              title: "teh title",
              content: "teh content"
            }
          ) {
            id
            postableId
            postableType
            userId
            content
            
            postable {
              name
            }
            
            user {
              name
            }
          }
        }
      `
    });
}

function updatePostHelper(id, token) {
  return request(app)
    .post('/api/graphql')
    .set(token)
    .send({
      query: `
        mutation {
          updatePost(
            input: {
              id: ${id},
              content: "teh content toooz"
            }
          ) {
            id
            postableId
            postableType
            userId
            content
            
            postable {
              name
            }
            
            user {
              name
            }
          }
        }
      `
    });
}
