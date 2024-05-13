import request from 'supertest';
import { expect } from 'chai';

import app from 'app';
import knex from 'test/utils/knex';
import getToken from 'test/utils/getToken';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';


describe('Query', () => {

  before(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Recipe', () => {

    it('Should return recipes', () => {
      return request(app)
        .post('/api/graphql')
        .send({
          query: `
            query {
              recipes {
                id
                name
              }
            }
          `
        })
        .then((res) => {
          const { body: { data: { recipes } } } = res;

          expect(recipes.length).to.equal(1);
          expect(recipes[0]).to.have.all.keys('id', 'name');
          expect(recipes[0].name).to.contain('Lavender');
        });
    });

    describe('Recipe visibility - have friendships', () => {
      let token;

      before(() => {
        return getToken({
          username: 'nazar',
          password: 'password'
        }).then(t => (token = t));
      });

      it('Should return public and my recipes', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
            query {
              recipes {
                id
                name
              }
            }
          `
          })
          .then((res) => {
            const { body: { data: { recipes } } } = res;

            expect(recipes.length).to.equal(3);
            expect(recipes[0]).to.have.all.keys('id', 'name');
          });
      });

      describe("My Friend's Recipe", () => {
        let recipeId;

        beforeEach(() =>
          getRecipeByName('Trial Remedial Recipe 2').then(
            res => (recipeId = res.id)
          )
        );

        it("Should let me access my friend's recipe", () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              query {
                recipe(id: ${recipeId}) {
                  id
                  name
                }
              }
          `
            })
            .then((res) => {
              const { body: { data: { recipe } } } = res;

              expect(recipe).to.have.all.keys('id', 'name');
              expect(recipe.name).to.equal('Trial Remedial Recipe 2');
            });
        });
      });

      describe("A Stranger's Recipe", () => {
        let recipeId;

        beforeEach(() =>
          getRecipeByName('Random Recipe 1').then(
            res => (recipeId = res.id)
          )
        );

        it('Should not let me access a stranger\'s recipe ', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              query {
                recipe(id: ${recipeId}) {
                  id
                  name
                }
              }
          `
            })
            .then((res) => {
              expect(res.body.data.recipe).to.be.null;
              expect(res.body.errors).to.be.ok;

              expect(res.body.errors[0].message).to.contain('Recipe is private');
            });
        });
      });
    });

    describe('Recipe visibility - friendship not confirmed', () => {
      let token;

      before(() => {
        return getToken({
          username: 'stranger',
          password: 'password'
        }).then(t => (token = t));
      });

      describe("Not my recipes", () => {
        let recipeId;

        beforeEach(() =>
          getRecipeByName('Trial Remedial Recipe 2').then(
            res => (recipeId = res.id)
          )
        );

        it("Should not let me access private recipes", () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              query {
                recipe(id: ${recipeId}) {
                  id
                  name
                }
              }
          `
            })
            .then((res) => {
              expect(res.body.data.recipe).to.be.null;
              expect(res.body.errors).to.be.ok;

              expect(res.body.errors[0].message).to.contain('Recipe is private');
            });
        });
      });
    });

  });

});

// helpers

function getRecipeByName(name) {
  return knex('recipes')
    .select('id')
    .where({ name })
    .first();
}
