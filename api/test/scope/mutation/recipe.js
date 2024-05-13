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

  describe('Recipe', () => {
    let token;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    describe('createRecipe', () => {
      it('should create a recipe', () => {
        return createRecipeHelper(token)
          .then(res => responseHandler(res, () => {
            const { body: { data: { createRecipe } } } = res;

            expect(createRecipe).to.be.ok;
            expect(createRecipe.userId).to.be.ok;
            expect(createRecipe.name).to.be.ok;
            expect(createRecipe.description).to.contain('rel="nofollow noopener noreferrer"');
            expect(createRecipe.notes).to.contain('rel="nofollow noopener noreferrer"');
            expect(createRecipe.visibility).to.equal(0);
            expect(createRecipe.settings).to.be.ok;
            expect(createRecipe.summary).to.be.ok;
            expect(createRecipe.summary.totals).to.be.ok;
            expect(createRecipe.summary.breakdowns).to.be.ok;
            expect(createRecipe.summary.properties).to.be.ok;
            expect(createRecipe.summary.saturations).to.be.ok;

            expect(createRecipe.recipeOils.length).to.equal(2);
            expect(createRecipe.recipeOils[0].oil).to.be.ok;
          }));
      });
    });

    describe('updateRecipe', () => {
      it('Should update a recipe', () => {
        return knex('recipes').where({ name: 'Trial Remedial Recipe 1' }).first()
          .then((dbRecipe) => {
            return updateRecipeHelper(dbRecipe.id, token)
              .then(res => responseHandler(res, () => {
                const { body: { data: { updateRecipe } } } = res;

                expect(updateRecipe).to.be.ok;
                expect(updateRecipe.userId).to.be.ok;
                expect(updateRecipe.name).to.be.ok;
                expect(updateRecipe.description).to.contain('rel="nofollow noopener noreferrer"');
                expect(updateRecipe.notes).to.contain('rel="nofollow noopener noreferrer"');
                expect(updateRecipe.visibility).to.equal(0);
                expect(updateRecipe.settings).to.be.ok;
                expect(updateRecipe.summary).to.be.ok;
                expect(updateRecipe.summary.totals).to.be.ok;
                expect(updateRecipe.summary.breakdowns).to.be.ok;
                expect(updateRecipe.summary.properties).to.be.ok;
                expect(updateRecipe.summary.saturations).to.be.ok;

                expect(updateRecipe.recipeOils.length).to.equal(2);
                expect(updateRecipe.recipeOils[0].oil).to.be.ok;
              }))
              .then(() => {
                return knex('oils').whereIn('id', [1, 2])
                  .then((oils) => {
                    expect(oils[0].stats.recipes.count).equal(3);
                    expect(oils[1].stats.recipes.count).equal(3);
                  });
              });
          });
      });
    });

  });

});

// helpers

function createRecipeHelper(token) {
  return recipePayload()
    .then((recipe) => {
      return request(app)
        .post('/api/graphql')
        .set(token)
        .send({
          query: `
        mutation createRecipe($recipe: RecipeInput!) {
          createRecipe(recipe: $recipe) {
            id
            userId
            name
            notes
            description
            visibility
            
            settings {
              uom
              ratioKoh
              soapType
              superFat
              superfatAfter
              totalUom
              kohPurity
              naohPurity
              ratioNaoh
              waterRatio
              lyeCalcType
              totalWeight
              totalsIncludeWater
              fragrance
              fragrancePpo
              fragranceType
              waterDiscount
              lyeWaterLyeRatio
              lyeWaterWaterRatio
              recipeLyeConcentration
            }
            
            summary {
              totals {
                totalLye
                totalSuperfat
                waterLyeRatio
                totalOilWeight
                fragranceWeight
                lyeConcentration
                totalBatchWeight
                totalWaterWeight              
              }
              
              breakdowns {
                oleic
                capric
                lauric
                stearic
                caprylic
                linoleic
                myristic
                palmitic
                linolenic
                ricinoleic
              }
              
              properties {
                ins
                bubbly
                iodine
                stable
                hardness
                cleansing
                condition
                longevity
              }
              
              saturations {
                saturated
                unsaturated
              }
            }
            
            recipeOils {
              id
              weight
              
              oil {
                id
                name
              }
            }
            
          }
        }
      `,
          variables: { recipe }
        });
    });
}

function updateRecipeHelper(id, token) {
  return recipePayload()
    .then((recipe) => {
      return request(app)
        .post('/api/graphql')
        .set(token)
        .send({
          query: `
        mutation updateRecipe($id: ID!, $recipe: RecipeInput!) {
          updateRecipe(id: $id, recipe: $recipe) {
            id
            userId
            name
            notes
            description
            visibility
            
            settings {
              uom
              ratioKoh
              soapType
              superFat
              superfatAfter
              totalUom
              kohPurity
              naohPurity
              ratioNaoh
              waterRatio
              lyeCalcType
              totalWeight
              totalsIncludeWater
              fragrance
              fragrancePpo
              fragranceType
              waterDiscount
              lyeWaterLyeRatio
              lyeWaterWaterRatio
              recipeLyeConcentration
            }
            
            summary {
              totals {
                totalLye
                totalSuperfat
                waterLyeRatio
                totalOilWeight
                fragranceWeight
                lyeConcentration
                totalBatchWeight
                totalWaterWeight              
              }
              
              breakdowns {
                oleic
                capric
                lauric
                stearic
                caprylic
                linoleic
                myristic
                palmitic
                linolenic
                ricinoleic
              }
              
              properties {
                ins
                bubbly
                iodine
                stable
                hardness
                cleansing
                condition
                longevity
              }
              
              saturations {
                saturated
                unsaturated
              }
            }
            
            recipeOils {
              id
              weight
              
              oil {
                id
                name
              }
            }
            
          }
        }
      `,
          variables: { recipe, id }
        });
    });
}

function recipePayload() {
  return knex('oils')
    .limit(2)
    .then(([oil1, oil2]) => {
      return {
        name: "recipe name",
        description: "<p>recipe <a href=\"google.com\">description</a></p>",
        notes: "<p>recipe&nbsp;<a href=\"google.com\">notes</a></p>",
        summary: {
          totals: {
            totalOilWeight: 500,
            totalWaterWeight: 190,
            fragranceWeight: 15,
            totalLye: 60.263720598717036,
            totalSuperfat: 0,
            totalBatchWeight: 765.263720598717,
            lyeConcentration: 24.08008658008658,
            waterLyeRatio: 3.1528089887640447
          },
          breakdowns: {
            oleic: 38,
            capric: 0,
            lauric: 0,
            stearic: 8.5,
            caprylic: 0,
            linoleic: 13.5,
            myristic: 0.5,
            palmitic: 6,
            linolenic: 2,
            ricinoleic: 0
          },
          properties: {
            bubbly: 0.5,
            cleansing: 0.5,
            condition: 53.5,
            hardness: 15,
            longevity: 14.5,
            stable: 14.5,
            iodine: 84,
            ins: 94
          },
          saturations: {
            saturated: 15,
            unsaturated: 85
          }
        },
        visibility: 0,
        settings: {
          fragrancePpo: 30,
          fragranceType: "ratio",
          fragrance: 3,
          waterDiscount: 0,
          lyeWaterWaterRatio: 3,
          lyeWaterLyeRatio: 1,
          lyeCalcType: "ratio",
          superfatAfter: false,
          totalsIncludeWater: false,
          recipeLyeConcentration: 30,
          waterRatio: 38,
          superFat: 5,
          totalUom: "gram",
          totalWeight: 500,
          uom: "percent",
          naohPurity: 100,
          kohPurity: 90,
          ratioKoh: 50,
          ratioNaoh: 50,
          soapType: "naoh",
          oils: [
            {
              weight: 50,
              id: oil1.id
            },
            {
              weight: 50,
              id: oil2.id
            }
          ]
        }
      };
    });
}
