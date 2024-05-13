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

  describe('Oil', () => {

    describe('oil', () => {
      let testOil;

      beforeEach(() => knex('oils').where({ name: 'Abyssinian Oil' })
        .limit(1).then(res => ([testOil] = res)));

      it('Should return a requested oil', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                oil(id: ${testOil.id}) {
                  id
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { oil } } } = res;

            expect(oil).to.be.ok;
            expect(Number(oil.id)).to.equal(Number(testOil.id));
          }));
      });
    });

    describe('oils', () => {
      it('Should returns oils', () => {
        return request(app)
          .post('/api/graphql')
          .send({
            query: `
              query {
                oils {
                  id
                  name
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { oils } } } = res;

            expect(oils).to.be.ok;
            expect(oils.length).to.be.above(0);
          }));
      });
    });


  });
});
