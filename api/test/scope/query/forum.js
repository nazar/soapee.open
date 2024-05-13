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

  describe('Forum', () => {

    describe('forum', () => {
      let testForum;

      beforeEach(() => knex('forums').where({ name: 'testforum' })
        .limit(1).then(res => ([testForum] = res)));

      it('Should return the requested forum', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                forum(id: ${testForum.id}) {
                  id
                  name
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forum } } } = res;

            expect(forum).to.be.ok;
            expect(Number(forum.id)).to.equal(Number(testForum.id));
            expect(forum.name).to.equal('testforum');
          }));
      });

      it('Should return a requested forum by name', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                forum(id: "${testForum.name}") {
                  id
                  name
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forum } } } = res;

            expect(forum).to.be.ok;
            expect(Number(forum.id)).to.equal(Number(testForum.id));
            expect(forum.name).to.equal('testforum');
          }));
      });
    });

    describe('forums', () => {

      it('Should return forums', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                forums {
                  id
                  name
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forums } } } = res;

            expect(forums).to.be.ok;
            expect(forums.length).to.equal(3);
          }));
      });

      it('Should search forums', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query forums($search: ForumSearchInput) {
                forums(search: $search) {
                  id
                  name
                }
              }
            `,
            operationName: 'forums',
            variables: { search: { name: 'another_forum' } }
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forums } } } = res;

            expect(forums).to.be.ok;
            expect(forums.length).to.equal(2);
            expect(forums[0].name).to.equal('another_forum');
          }));
      });

      it('Should page forums', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query forums($page: PaginationInput) {
                forums(page: $page) {
                  id
                  name
                }
              }
            `,
            operationName: 'forums',
            variables: { page: { limit: 1 } }
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forums } } } = res;

            expect(forums).to.be.ok;
            expect(forums.length).to.equal(1);
          }));
      });

      describe('search by userId', () => {
        let user;

        beforeEach(() => knex('users')
          .where({ name: 'Nazar Aziz' })
          .limit(1)
          .then(([res]) => (user = res))
        );


        it('Should returns forums owned by given userId', () => {
          return request(app)
            .post('/api/graphql')
            .send({
              query: `
              query forums($search: ForumSearchInput) {
                forums(search: $search) {
                  id
                  name
                }
              }
            `,
              operationName: 'forums',
              variables: { search: { userId: user.id } }
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { forums } } } = res;

              expect(forums).to.be.ok;
              expect(forums.length).to.equal(2);
            }));

        });
      });
    });

    describe('forumsSummary', () => {

      it('Should summarise a query', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query forumsSummary($search: ForumSearchInput) {
                forumsSummary(search: $search) {
                  count
                }
              }
            `,
            operationName: 'forumsSummary',
            variables: { search: { name: 'another_forum' } }
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { forumsSummary } } } = res;

            expect(forumsSummary).to.be.ok;
            expect(forumsSummary.count).to.equal(2);
          }));
      });

    });
  });
});
