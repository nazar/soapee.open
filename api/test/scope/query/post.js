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

  describe('Post', () => {

    describe('post', () => {
      let testPost;

      beforeEach(() => knex('posts').limit(1)
        .then(res => ([testPost] = res)));

      it('Should return the requested post', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                post(id: ${testPost.id}) {
                  id
                  content
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { post } } } = res;

            expect(post).to.be.ok;
            expect(post.id).to.be.ok;
            expect(post.content).to.be.ok;
          }));
      });

    });

    describe('posts', () => {
      let userId;

      beforeEach(() => knex('posts')
        .where({ content: 'this is the post content' })
        .limit(1)
        .then(([res]) => (userId = res.user_id))
      );

      it('Should returns searched posts', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query posts($search: PostsSearchInput!){
                posts(search: $search) {
                  id
                  content
                }
              }
            `,
            variables: {
              search: {
                userId
              }
            }
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { posts } } } = res;

            expect(posts).to.be.ok;
            expect(posts.length).to.be.above(1);
          }));
      });
    });

    describe('postsSummary', () => {
      let userId;

      beforeEach(() => knex('posts')
        .where({ content: 'this is the post content' })
        .limit(1)
        .then(([res]) => (userId = res.user_id))
      );

      it('Should returns searched posts', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query postsSummary($search: PostsSearchInput!){
                postsSummary(search: $search) {
                  count
                }
              }
            `,
            variables: {
              search: {
                userId
              }
            }
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { postsSummary } } } = res;

            expect(postsSummary).to.be.ok;
            expect(postsSummary.count).to.be.above(1);
          }));
      });
    });

  });
});
