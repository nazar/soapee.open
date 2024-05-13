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

  describe('Forum', () => {

    let token;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    describe('createForum', () => {

      it('should create a forum', () => {
        return createForumHelper(token)
          .then(res => responseHandler(res, () => {
            const { body: { data: { createForum } } } = res;

            expect(createForum.id).to.exist;
            expect(createForum.name).to.exist;
            expect(createForum.summary).to.exist;
            expect(createForum.banner).to.exist;
            expect(createForum.forumType).to.exist;
          }));
      });

      it('should restrict forum names 1', () => {
        return createForumHelper(token, { name: '_badname' })
          .then((res) => {
            expect(res.body.errors).to.be.ok;
          });
      });

      it('should restrict forum names 2', () => {
        return createForumHelper(token, { name: 'badname2' })
          .then((res) => {
            expect(res.body.errors).to.be.ok;
          });
      });

    });

    describe('updateForum', () => {
      let forum;

      beforeEach(() => knex('forums')
        .where({ name: 'testforum' })
        .then(res => ([forum] = res))
      );

      it('Should update a forum', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                updateForum(
                  id: ${forum.id},
                  input: {
                    summary: "teh summary2",
                    banner: "teh banner2",
                    forumType: public
                  }
                ) {
                  name
                  summary
                  banner
                  forumType
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { updateForum } } } = res;

            expect(updateForum.name).to.equal('testforum');
            expect(updateForum.summary).to.equal('teh summary2');
            expect(updateForum.banner).to.equal('teh banner2');
            expect(updateForum.forumType).to.equal('public');
          }));
      });
    });
  });

});

// helpers

function createForumHelper(token, { name = 'testtestforum' } = {}) {
  return request(app)
    .post('/api/graphql')
    .set(token)
    .send({
      query: `
        mutation {
          createForum(
            input: {
              name: "${name}",
              summary: "teh summary",
              banner: "teh banner",
              forumType: public
            }
          ) {
            id
            name
            summary
            banner
            forumType
          }
        }
      `
    });
}
