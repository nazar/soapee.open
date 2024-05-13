import request from 'supertest';
import { expect } from 'chai';

import app from 'app';

import knex from 'test/utils/knex';
import responseHandler from 'test/utils/graphql';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Query', () => {

  before(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Comment', () => {

    describe('Queries', () => {

      describe('commentableComments', () => {
        let testRecipe;

        beforeEach(() => knex('recipes')
          .where({ name: 'Lavender' })
          .limit(1)
          .then(res => ([testRecipe] = res)));

        it('Should return comments for a commentable', () =>
          request(app)
            .post('/api/graphql')
            .send({
              query: `
                query {
                  commentableComments(
                    commentable: {
                      commentableId: ${testRecipe.id},
                      commentableType: recipes
                    }
                  ) {
                    id
                    comment
                  }
                }
            `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { commentableComments } } } = res;

              expect(commentableComments.length).to.equal(2);
            }))
        );

      });

      describe('commentableCommentsSummary', () => {

        let testRecipe;

        beforeEach(() => knex('recipes')
          .where({ name: 'Lavender' })
          .limit(1)
          .then(res => ([testRecipe] = res)));


        it('Should summarize', () =>
          request(app)
            .post('/api/graphql')
            .send({
              query: `
                query {
                  commentableCommentsSummary(
                    commentable: {
                      commentableId: ${testRecipe.id},
                      commentableType: recipes
                    }
                  ) {
                    count
                  }
                }
              `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { commentableCommentsSummary } } } = res;

              expect(commentableCommentsSummary.count).to.equal(2);
            }))
        );
      });

      describe('comments', () => {
        let testUser;

        beforeEach(() => knex('users')
          .where({ name: 'Nazar Aziz' })
          .limit(1)
          .then(([res]) => (testUser = res))
        );

        it('Should find comments by user', () => request(app)
          .post('/api/graphql')
          .send({
            query: `
                query {
                  comments (
                    search: {
                      userId: ${testUser.id},
                    }
                  ) {
                    id
                    comment
                  }
                }
              `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { comments } } } = res;

            expect(comments.length).to.equal(1);
          })));
      });

      describe('commentsSummary', () => {
        let testUser;

        beforeEach(() => knex('users')
          .where({ name: 'Nazar Aziz' })
          .limit(1)
          .then(([res]) => (testUser = res))
        );

        it('Should find comments by user', () => request(app)
          .post('/api/graphql')
          .send({
            query: `
                query {
                  commentsSummary (
                    search: {
                      userId: ${testUser.id},
                    }
                  ) {
                    count
                  }
                }
              `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { commentsSummary } } } = res;

            expect(commentsSummary.count).to.equal(1);
          })));
      });

    });

  });
});
