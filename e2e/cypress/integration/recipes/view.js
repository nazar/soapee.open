import { assertOils, assertOilTotals, assertOilsGrams, assertOilTotalsGram } from '../../utils/recipeViewHelpers';
import {
  assertTotalWaterWeight,
  assertTotalNaohWeight,
  assertTotalKohWeight,
  assertTotalMixedNoahWeight,
  assertTotalMixedLyeWeight,
  assertTotalOilWeight,
  assertTotalFragranceOilWeight,
  assertTotalBatchWeight,
  assertTotalSuperfat,
  assertTotalLyeConcentration,
  assertTotalWaterLyeRation,
  assertRecipeProperties,
  assertFattyAcids,
  assertTotalNaohKohRatio,
  assertTotalSaturatedRatio
} from '../../utils/calculatorHelpers';

describe('Recipes', () => {
  context('Viewing Recipes', () => {
    context('Anonymous users', () => {
      context('Querying', () => {
        before(() => cy.resetDb());

        context('Viewing Recipes - recipe 2', () => {
          beforeEach(() => cy.visit('/recipes/2'));

          it('Should load the recipe', () => {
            cy
              .waitForQuery('commentableComments')

              .get('.header:contains("Lavender")').should('exist')
              .get('[data-cy=comment]').its('length').should('be.above', 0);
          });

          it('Should not show user only recipe controls', () => {
            cy
              .waitForQuery('recipe')

              .get('button:contains("Report")').should('not.exist');
          });
        });

        context('Login option when logged out and viewing private recipes', () => {
          beforeEach(() => cy.visit('/recipes/1'));

          it('Should offer option to login and view my own recipes', () => {
            cy
              .waitForQuery('recipe', { skipErrors: true })
              .get('button:contains("Login")').click()

              .get('[data-cy=login-signup-modal]')
              .within(() => {
                cy
                  .get('input[name=username]').type('nazar')
                  .get('input[name=password]').type('password')
                  .get('button:contains("Login")').click()
                  .waitForQuery('localUserLogin')
                  .waitForQuery('recipe');
              })

              .get('.header:contains("Glycerine Hand and Body Liquid Soap")').should('exist')
              .get('[data-cy=recipe-comps-oil-row-name]:contains("Almond Butter")').should('exist')
              .get('[data-cy=recipe-comps-oil-row-name]:contains("Almond Oil, sweet")').should('exist');
          });

          it('Should offer option to login and view recipes but still error when viewing not my recipe', () => {
            cy
              .waitForQuery('recipe', { skipErrors: true })
              .get('button:contains("Login")').click()

              .get('[data-cy=login-signup-modal]')
              .within(() => {
                cy
                  .get('input[name=username]').type('aziz')
                  .get('input[name=password]').type('password')
                  .get('button:contains("Login")').click()
                  .waitForQuery('localUserLogin')
                  .waitForQuery('recipe', { skipErrors: true });
              })

              .get('.header:contains("Glycerine Hand and Body Liquid Soap")').should('not.exist')
              .get('button:contains("Login")').should('not.exist')
              .get('.header:contains("Recipe is private and can only be viewed by its owner")').should('exist');
          });
        });

        context('Recipe Reactions', () => {
          it('Should show reactions but not update them', () => {
            cy
              .visit('/recipes/17')
              .waitForQuery('recipe')

              .get('[data-cy=reactions]').should('exist')
              .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
              .get('[data-cy=reactions] [data-cy=add-reaction]').should('not.exist');
          });
        });

        context('Recipe correctness', () => {
          it('Should display recipe 7 correctly', () => {
            // this is recipe 33 on soapee
            cy
              .visit('/recipes/7')
              .waitForQuery('recipe');

            assertOils([
              { oil: 'Coconut Oil, 76 deg', ratio: '30', weight: '7.2', grams: '204.1' },
              { oil: 'Lard, Pig Tallow (Manteca)', ratio: '60', weight: '14.4', grams: '408.2' },
              { oil: 'Sunflower Oil', ratio: '10', weight: '2.4', grams: '68' }
            ]);

            assertOilTotals({ ratio: 100, weight: 24, grams: 680.4 });

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('9.12 ounces');
            assertTotalNaohWeight('3.49 ounces');
            assertTotalOilWeight('24 ounces');
            assertTotalFragranceOilWeight('0.72 ounces');
            assertTotalBatchWeight('37.33 ounces');
            assertTotalSuperfat('5%');
            assertTotalLyeConcentration('27.68%');
            assertTotalWaterLyeRation('2.613 : 1');
            // FIXME double check ratio calcs
            //assertTotalSaturatedRatio('50 : 43');

            assertRecipeProperties({
              bubbly: 21,
              cleansing: 21,
              condition: 43,
              hardness: 50,
              longevity: 29,
              stable: 29,
              iodine: 51,
              ins: 167
            });

            assertFattyAcids({
              lauric: 14,
              linoleic: 11,
              myristic: 6,
              oleic: 32,
              palmitic: 20,
              stearic: 9
            });
          });

          it('Should display recipe 8 correctly', () => {
            // this is recipe 35 on soapee
            cy
              .visit('/recipes/8')
              .waitForQuery('commentableComments');

            assertOilsGrams([
              { oil: 'Coconut Oil, 92 deg', ratio: '100', grams: '900' }
            ]);

            assertOilTotalsGram({ ratio: 100, grams: 900 });

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('288 grams');
            assertTotalNaohWeight('131.9 grams');
            assertTotalOilWeight('900 grams');
            assertTotalFragranceOilWeight('27 grams');
            assertTotalBatchWeight('1,346.9 grams');
            assertTotalSuperfat('20%');
            assertTotalLyeConcentration('31.4%');
            assertTotalWaterLyeRation('2.184 : 1');
            // FIXME double check ratio calcs
            //assertTotalSaturatedRatio('79 : 21');

            assertRecipeProperties({
              bubbly: 67,
              cleansing: 67,
              condition: 10,
              hardness: 79,
              longevity: 12,
              stable: 12,
              iodine: 3,
              ins: 258
            });

            assertFattyAcids({
              lauric: 48,
              linoleic: 2,
              myristic: 19,
              oleic: 8,
              palmitic: 9,
              stearic: 3
            });

            cy
              .get('.commentable-comments [data-cy=comment]').its('length').should('equal', 1);
          });

          it('Should display recipe 9 correctly', () => {
            // this is recipe 55 on soapee
            cy
              .visit('/recipes/9')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Castor Oil', ratio: '7', weight: '2.31', grams: '65.5' },
              { oil: 'Cocoa Butter', ratio: '6', weight: '1.98', grams: '56.1' },
              { oil: 'Coconut Oil, 76 deg', ratio: '26', weight: '8.58', grams: '243.2' },
              { oil: 'Olive Oil', ratio: '54', weight: '17.82', grams: '505.2' },
              { oil: 'Shea Butter', ratio: '7', weight: '2.31', grams: '65.5' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('13.2 ounces');
            assertTotalNaohWeight('4.85 ounces');
            assertTotalOilWeight('33 ounces');
            assertTotalFragranceOilWeight('0.99 ounces');
            assertTotalBatchWeight('52.04 ounces');
            assertTotalSuperfat('0%');
            assertTotalLyeConcentration('26.87%');
            assertTotalWaterLyeRation('2.722 : 1');
            // FIXME double check ratio calcs
            //assertTotalSaturatedRatio('37 : 60');

            assertRecipeProperties({
              bubbly: 24,
              cleansing: 17,
              condition: 60,
              hardness: 37,
              longevity: 19,
              stable: 25,
              iodine: 61,
              ins: 148
            });

            assertFattyAcids({
              lauric: 12,
              linoleic: 8,
              linolenic: 1,
              myristic: 5,
              oleic: 45,
              palmitic: 12,
              ricinoleic: 6,
              stearic: 7
            });
          });

          it('Should display recipe 10 correctly', () => {
            // this is recipe 115 on soapee
            cy
              .visit('/recipes/10')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Castor Oil', ratio: '15', weight: '7.2', grams: '204.1' },
              { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '9.6', grams: '272.2' },
              { oil: 'Lard, Pig Tallow (Manteca)', ratio: '25', weight: '12', grams: '340.2' },
              { oil: 'Olive Oil', ratio: '20', weight: '9.6', grams: '272.2' },
              { oil: 'Stearic Acid', ratio: '20', weight: '9.6', grams: '272.2' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('18.24 ounces');
            assertTotalMixedNoahWeight('2.64 ounces');
            assertTotalKohWeight('6.18 ounces at 90% purity');
            assertTotalMixedLyeWeight('8.82 ounces');
            assertTotalOilWeight('48 ounces');
            assertTotalFragranceOilWeight('1.44 ounces');
            assertTotalBatchWeight('76.5 ounces');
            assertTotalSuperfat('6%');
            assertTotalLyeConcentration('32.61%');
            assertTotalWaterLyeRation('2.067 : 1');
            // FIXME double check ratio calcs
            //assertTotalSaturatedRatio('50 : 51');

            assertRecipeProperties({
              bubbly: 27,
              cleansing: 14,
              condition: 46,
              hardness: 50,
              longevity: 36,
              stable: 49,
              iodine: 47,
              ins: 161
            });

            assertFattyAcids({
              lauric: 10,
              linoleic: 5,
              myristic: 4,
              oleic: 28,
              palmitic: 12,
              ricinoleic: 14,
              stearic: 24
            });

            cy
              .visit('/recipes/10/copy')
              .waitForQuery('recipeForEditClone')

              .get('input[name=kohPurity]').should('have.value', '90')
              .get('button:contains("Save as Copy")').should('not.exist');
          });

          it('Should load recipe 11 correctly', () => {
            // recipe 476 on soapee
            cy
              .visit('/recipes/11')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Avocado Oil', ratio: '8', weight: '1', grams: '28.3' },
              { oil: 'Cocoa Butter', ratio: '25', weight: '3', grams: '85' },
              { oil: 'Coconut Oil, 76 deg', ratio: '8', weight: '1', grams: '28.3' },
              { oil: 'Tallow Beef', ratio: '58', weight: '7', grams: '198.4' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('5.22 ounces');
            assertTotalMixedNoahWeight('0.57 ounces');
            assertTotalKohWeight('1.66 ounces at 90% purity');
            assertTotalMixedLyeWeight('2.24 ounces');
            assertTotalOilWeight('12 ounces');
            assertTotalFragranceOilWeight('0.36 ounces');
            assertTotalBatchWeight('19.82 ounces');
            assertTotalSuperfat('5%');
            assertTotalLyeConcentration('30%');
            assertTotalNaohKohRatio('35% / 65%');
            assertTotalWaterLyeRation('2.333 : 1');
            assertTotalSaturatedRatio('58 : 43');

            assertRecipeProperties({
              bubbly: 10,
              cleansing: 10,
              condition: 40,
              hardness: 58,
              longevity: 47,
              stable: 47,
              iodine: 44,
              ins: 155
            });

            assertFattyAcids({
              lauric: 5,
              linoleic: 4,
              linolenic: 1,
              myristic: 5,
              oleic: 35,
              palmitic: 26,
              stearic: 22
            });
          });

          it('Should load recipe 12 correctly', () => {
            // recipe 511 on soapee
            cy
              .visit('/recipes/12')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Almond Oil, sweet', ratio: '25', weight: '75' },
              { oil: 'Castor Oil', ratio: '15', weight: '45' },
              { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '60' },
              { oil: 'Corn Oil', ratio: '30', weight: '90' },
              { oil: 'Tallow Beef', ratio: '10', weight: '30' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('114 grams');
            assertTotalNaohWeight('67.6 grams at 90% purity');
            assertTotalOilWeight('300 grams');
            assertTotalFragranceOilWeight('9 grams');
            assertTotalBatchWeight('490.6 grams');
            assertTotalSuperfat('1%');
            assertTotalLyeConcentration('37.2%');
            assertTotalWaterLyeRation('1.687 : 1');
            assertTotalSaturatedRatio('28 : 72');

            assertRecipeProperties({
              bubbly: 28,
              cleansing: 14,
              condition: 68,
              hardness: 28,
              longevity: 13,
              stable: 27,
              iodine: 79,
              ins: 126
            });

            assertFattyAcids({
              lauric: 10,
              linoleic: 21,
              myristic: 4,
              oleic: 33,
              palmitic: 10,
              ricinoleic: 14,
              stearic: 3
            });
          });

          it('Should load recipe 13 correctly', () => {
            // recipe 2825 on soapee
            cy
              .visit('/recipes/13')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '380' },
              { oil: 'Grapeseed Oil', ratio: '5', weight: '95' },
              { oil: 'Lard, Pig Tallow (Manteca)', ratio: '50', weight: '950' },
              { oil: 'Safflower Oil, high oleic', ratio: '20', weight: '380' },
              { oil: 'Shea Butter', ratio: '5', weight: '95' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('559 grams');
            assertTotalNaohWeight('279.5 grams');
            assertTotalOilWeight('1,900 grams');
            assertTotalFragranceOilWeight('57 grams');
            assertTotalBatchWeight('2,795.5 grams');
            assertTotalSuperfat('0%');
            assertTotalLyeConcentration('33.3%');
            assertTotalWaterLyeRation('2 : 1');
            assertTotalSaturatedRatio('41 : 59');

            assertRecipeProperties({
              bubbly: 14,
              cleansing: 14,
              condition: 54,
              hardness: 41,
              longevity: 27,
              stable: 27,
              iodine: 59,
              ins: 150
            });

            assertFattyAcids({
              lauric: 10,
              linoleic: 10,
              myristic: 4,
              oleic: 43,
              palmitic: 17,
              stearic: 10
            });
          });

          it('Should load recipe 14 correctly', () => {
            // recipe 3377 on soapee
            cy
              .visit('/recipes/14')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Castor Oil', ratio: '18', weight: '4.5', grams: '127.6' },
              { oil: 'Cocoa Butter', ratio: '9', weight: '2.3', grams: '65.2' },
              { oil: 'Coconut Oil, 76 deg', ratio: '25.7', weight: '6.3', grams: '178.6' },
              { oil: 'Soybean, fully hydrogenated (soy wax)', ratio: '46.7', weight: '11.46', grams: '324.9' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('13.48 ounces');
            assertTotalMixedNoahWeight('1.35 ounces');
            assertTotalKohWeight('3.15 ounces at 90% purity');
            assertTotalMixedLyeWeight('4.49 ounces');
            assertTotalOilWeight('24.56 ounces');
            assertTotalFragranceOilWeight('0.74 ounces');
            assertTotalBatchWeight('43.27 ounces');
            assertTotalSuperfat('7%');
            assertTotalLyeConcentration('25%');
            assertTotalNaohKohRatio('40% / 60%');
            assertTotalWaterLyeRation('3 : 1');
            assertTotalSaturatedRatio('72 : 28');

            assertRecipeProperties({
              bubbly: 34,
              cleansing: 17,
              condition: 24,
              hardness: 72,
              longevity: 55,
              stable: 71,
              iodine: 22,
              ins: 187
            });

            assertFattyAcids({
              lauric: 12,
              linoleic: 2,
              myristic: 5,
              oleic: 6,
              palmitic: 10,
              ricinoleic: 16,
              stearic: 44
            });
          });

          it('Should load recipe 15 correctly', () => {
            // recipe 25495 on soapee
            cy
              .visit('/recipes/15')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Almond Oil, sweet', ratio: '5', weight: '2.5', grams: '2,500' },
              { oil: 'Castor Oil', ratio: '5', weight: '2.5', grams: '2,500' },
              { oil: 'Coconut Oil, 76 deg', ratio: '25', weight: '12.5', grams: '12,500' },
              { oil: 'Olive Oil', ratio: '40', weight: '20', grams: '20,000' },
              { oil: 'Palm Oil', ratio: '25', weight: '12.5', grams: '12,500' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('7.103 kilos (33% less)');
            assertTotalNaohWeight('7.067 kilos');
            assertTotalOilWeight('50 kilos');
            assertTotalFragranceOilWeight('1.5 kilos');
            assertTotalBatchWeight('65.67 kilos');
            assertTotalSuperfat('5%');
            assertTotalLyeConcentration('40%');
            assertTotalWaterLyeRation('1.005 : 1');
            assertTotalSaturatedRatio('39 : 61');

            assertRecipeProperties({
              bubbly: 22,
              cleansing: 17,
              condition: 57,
              hardness: 39,
              longevity: 22,
              stable: 27,
              iodine: 59,
              ins: 152
            });

            assertFattyAcids({
              lauric: 12,
              linoleic: 9,
              myristic: 5,
              oleic: 43,
              palmitic: 19,
              ricinoleic: 5,
              stearic: 3
            });
          });

          it('Should load recipe 16 correctly', () => {
            // recipe 24167 on soapee
            cy
              .visit('/recipes/16')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Avocado Oil', ratio: '7', weight: '105' },
              { oil: 'Castor Oil', ratio: '7', weight: '105' },
              { oil: 'Coconut Oil, 76 deg', ratio: '50', weight: '750' },
              { oil: 'Neem Seed Oil', ratio: '10', weight: '150' },
              { oil: 'Olive Oil', ratio: '20', weight: '300' },
              { oil: 'Shea Butter', ratio: '6', weight: '90' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('495 grams');
            assertTotalNaohWeight('225.6 grams');
            assertTotalOilWeight('1,500 grams');
            assertTotalFragranceOilWeight('45 grams');
            assertTotalBatchWeight('2,265.6 grams');
            assertTotalSuperfat('5%');
            assertTotalLyeConcentration('31.3%');
            assertTotalWaterLyeRation('2.194 : 1');
            assertTotalSaturatedRatio('51 : 49');

            assertRecipeProperties({
              bubbly: 40,
              cleansing: 34,
              condition: 42,
              hardness: 51,
              longevity: 17,
              stable: 24,
              iodine: 45,
              ins: 183
            });

            assertFattyAcids({
              lauric: 24,
              linoleic: 6,
              myristic: 10,
              oleic: 30,
              palmitic: 11,
              ricinoleic: 6,
              stearic: 6
            });
          });

          it('Should load recipe 17 correctly', () => {
            // recipe 30572 on soapee
            cy
              .visit('/recipes/17')
              .waitForQuery('commentableComments');

            assertOils([
              { oil: 'Coconut Oil, fractionated', ratio: '50', weight: '250' },
              { oil: 'Sunflower Oil', ratio: '50', weight: '250' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('150 grams');
            assertTotalNaohWeight('91.6 grams');
            assertTotalOilWeight('500 grams');
            assertTotalFragranceOilWeight('15 grams');
            assertTotalBatchWeight('756.6 grams');
            assertTotalSuperfat('0%');
            assertTotalLyeConcentration('37.9%');
            assertTotalWaterLyeRation('1.638 : 1');
            assertTotalSaturatedRatio('56 : 45');

            assertRecipeProperties({
              bubbly: 50,
              cleansing: 50,
              condition: 44,
              hardness: 56,
              longevity: 6,
              stable: 6,
              iodine: 67,
              ins: 194
            });

            assertFattyAcids({
              capric: 22,
              caprylic: 27,
              lauric: 1,
              linoleic: 35,
              linolenic: 1,
              myristic: 1,
              oleic: 8,
              palmitic: 4,
              stearic: 2
            });
          });

          it('Should load recipe 18 correctly', () => {
            // recipe 29341 on soapee - fragrance not handled correctly on soapee
            cy
              .visit('/recipes/18')
              .waitForQuery('commentableComments');

            assertOilsGrams([
              { oil: 'Almond Oil, sweet', ratio: '5', weight: '42.5' },
              { oil: 'Castor Oil', ratio: '5', weight: '42.5' },
              { oil: 'Coconut Oil, 76 deg', ratio: '30', weight: '255.1' },
              { oil: 'Lard, Pig Tallow (Manteca)', ratio: '20', weight: '170.1' },
              { oil: 'Olive Oil', ratio: '40', weight: '340.2' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('7.98 ounces');
            assertTotalNaohWeight('4.3 ounces');
            assertTotalOilWeight('30 ounces');
            assertTotalFragranceOilWeight('0.9 ounces');
            assertTotalBatchWeight('43.17 ounces');
            assertTotalSuperfat('5%');
            assertTotalLyeConcentration('35%');
            assertTotalWaterLyeRation('1.857 : 1');
            assertTotalSaturatedRatio('39 : 61');

            assertRecipeProperties({
              bubbly: 25,
              cleansing: 20,
              condition: 56,
              hardness: 39,
              longevity: 19,
              stable: 23,
              iodine: 58,
              ins: 157
            });

            assertFattyAcids({
              lauric: 14,
              linoleic: 8,
              myristic: 6,
              oleic: 43,
              palmitic: 14,
              ricinoleic: 5,
              stearic: 5
            });
          });
        });

        context('Error Management', () => {
          it('Should display an error message when for invalid recipe ids', () => {
            cy
              .visit('/recipes/999')

              .get('.header:contains("Recipe not found")').should('exist')
              .get('p:contains("Could not find this recipe. It might have been deleted by its owner")').should('exist');
          });

          it('Should display an error message when viewing Friends only visibility recipe for non friends', () => {
            cy
              .visit('/recipes/4')
              .get('.header:contains("Recipe is private and can only be viewed by its owner or the owner friends")')
              .should('exist');
          });
        });
      });
    });

    context('User1', () => {
      context('Querying', () => {
        before(() => cy.resetDb());
        beforeEach(() => cy.loginUser1());

        it('Should not load other users private recipes', () => {
          cy
            .visit('/recipes/6')
            .waitForQuery('recipe', { skipErrors: true })
            .get('.header:contains("Recipe is private and can only be viewed by its owner")').should('exist');
        });

        it('Should be able to view my friends recipes', () => {
          cy
            .visit('/recipes/4')
            .waitForQuery('recipe')
            .waitForQuery('commentableComments')

            .get('.header:contains("Trial Remedial Recipe 2")').should('exist')
            .get('[data-cy=comment]').its('length').should('be.above', 0);
        });

        it('Should handle from recipe hack attempt - not my recipe', () => {
          cy
            .visit('/recipes/19')
            .waitForQuery('recipe')

            .get('[data-cy=copied-from]:contains("Lavender")').should('not.exist');
        });

        it('Should handle from recipe with deleted from recipe', () => {
          cy
            .visit('/recipes/20')
            .waitForQuery('commentableComments')

            .get('[data-cy=copied-from]:contains("Lavender")').should('not.exist');
        });

        it('Should display additives correctly', () => {
          cy
            .visit('/recipes/20')
            .waitForQuery('commentableComments')

            .get('[data-cy=additives-breakdown]')
            .within(() => {
              cy
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper") [data-cy=recipe-comps-additive-row-measure]:contains("1 tsp")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("salt")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper") [data-cy=recipe-comps-additive-row-name] a')
                .invoke('attr', 'href').should('contain', '/settings/additives/2');
            });
        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1());

        it('Should add my recipe to the feed if I change it to public', () => {
          cy
            .visit('/recipes/1/edit')
            .waitForQuery('recipeForEditClone')

            .get('label:contains("Public")').click()
            .get('button:contains("Save Recipe")').click()
            .waitForQuery('updateRecipe')
            .waitForQuery('recipe')

            .pushHistory('/feed')
            .waitForQuery('getFeed')

            .get('[data-cy=feed-item-new-public-recipe]:contains("Glycerine Hand")').should('exist');
        });

        it('Should load additives correctly when editing a recipe and update additives', () => {
          cy
            .visit('/recipes/20/edit')
            .waitForQuery('additives')

            .get('[data-cy=list-additives-weights-segment]')
            .within(() => {
              cy
                .get('[data-cy=additive-selected-row]:contains("pepper")').should('exist')
                .get('[data-cy=additive-selected-row]:contains("pepper") input').should('have.value', '1 tsp')
                .get('[data-cy=additive-selected-row]:contains("salt") input').type('2 tsp');
            })
            .get('button:contains("Save Recipe")').click()
            .waitForQuery('updateRecipe')
            .waitForQuery('recipe')

            .get('[data-cy=additives-breakdown]')
            .within(() => {
              cy
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper") [data-cy=recipe-comps-additive-row-measure]:contains("1 tsp")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("pepper") [data-cy=recipe-comps-additive-row-name] a')
                .invoke('attr', 'href').should('contain', '/settings/additives/2')

                .get('[data-cy=recipe-comps-additive-row]:contains("salt")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("salt") [data-cy=recipe-comps-additive-row-measure]:contains("2 tsp")').should('exist');
            });
        });
      });
    });
  });

  context('Saving Existing Recipes', () => {
    beforeEach(() => cy.resetDb());

    context('User1', () => {
      beforeEach(() => cy.loginUser1());

      it('Should load and save recipe 7 correctly', () => {
        // this is recipe 33 on soapee
        cy
          .visit('/recipes/7/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/7')
          .reload()
          .waitForQuery('commentableComments');

        assertOils([
          { oil: 'Coconut Oil, 76 deg', ratio: '30', weight: '7.2', grams: '204.1' },
          { oil: 'Lard, Pig Tallow (Manteca)', ratio: '60', weight: '14.4', grams: '408.2' },
          { oil: 'Sunflower Oil', ratio: '10', weight: '2.4', grams: '68' }
        ]);

        assertOilTotals({ ratio: 100, weight: 24, grams: 680.4 });

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('9.12 ounces');
        assertTotalNaohWeight('3.49 ounces');
        assertTotalOilWeight('24 ounces');
        assertTotalFragranceOilWeight('0.72 ounces');
        assertTotalBatchWeight('37.33 ounces');
        assertTotalSuperfat('5%');
        assertTotalLyeConcentration('27.68%');
        assertTotalWaterLyeRation('2.613 : 1');
        // FIXME double check ratio calcs
        //assertTotalSaturatedRatio('50 : 43');

        assertRecipeProperties({
          bubbly: 21,
          cleansing: 21,
          condition: 43,
          hardness: 50,
          longevity: 29,
          stable: 29,
          iodine: 51,
          ins: 167
        });

        assertFattyAcids({
          lauric: 14,
          linoleic: 11,
          myristic: 6,
          oleic: 32,
          palmitic: 20,
          stearic: 9
        });

      });

      it('Should load and save recipe 8 correctly', () => {
        // this is recipe 35 on soapee
        cy
          .visit('/recipes/8/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/8')
          .reload()
          .waitForQuery('commentableComments');

        assertOilsGrams([
          { oil: 'Coconut Oil, 92 deg', ratio: '100', grams: '900' }
        ]);

        assertOilTotalsGram({ ratio: 100, grams: 900 });

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('288 grams');
        assertTotalNaohWeight('131.9 grams');
        assertTotalOilWeight('900 grams');
        assertTotalFragranceOilWeight('27 grams');
        assertTotalBatchWeight('1,346.9 grams');
        assertTotalSuperfat('20%');
        assertTotalLyeConcentration('31.4%');
        assertTotalWaterLyeRation('2.184 : 1');
        // FIXME double check ratio calcs
        //assertTotalSaturatedRatio('79 : 21');

        assertRecipeProperties({
          bubbly: 67,
          cleansing: 67,
          condition: 10,
          hardness: 79,
          longevity: 12,
          stable: 12,
          iodine: 3,
          ins: 258
        });

        assertFattyAcids({
          lauric: 48,
          linoleic: 2,
          myristic: 19,
          oleic: 8,
          palmitic: 9,
          stearic: 3
        });

        cy
          .get('.commentable-comments [data-cy=comment]').its('length').should('equal', 1);
      });

      it('Should load and save recipe 9 correctly', () => {
        // this is recipe 55 on soapee
        cy
          .visit('/recipes/9/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/9')
          .reload()
          .waitForQuery('commentableComments');

        assertOils([
          { oil: 'Castor Oil', ratio: '7', weight: '2.31', grams: '65.5' },
          { oil: 'Cocoa Butter', ratio: '6', weight: '1.98', grams: '56.1' },
          { oil: 'Coconut Oil, 76 deg', ratio: '26', weight: '8.58', grams: '243.2' },
          { oil: 'Olive Oil', ratio: '54', weight: '17.82', grams: '505.2' },
          { oil: 'Shea Butter', ratio: '7', weight: '2.31', grams: '65.5' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('13.2 ounces');
        assertTotalNaohWeight('4.85 ounces');
        assertTotalOilWeight('33 ounces');
        assertTotalFragranceOilWeight('0.99 ounces');
        assertTotalBatchWeight('52.04 ounces');
        assertTotalSuperfat('0%');
        assertTotalLyeConcentration('26.87%');
        assertTotalWaterLyeRation('2.722 : 1');
        // FIXME double check ratio calcs
        //assertTotalSaturatedRatio('37 : 60');

        assertRecipeProperties({
          bubbly: 24,
          cleansing: 17,
          condition: 60,
          hardness: 37,
          longevity: 19,
          stable: 25,
          iodine: 61,
          ins: 148
        });

        assertFattyAcids({
          lauric: 12,
          linoleic: 8,
          linolenic: 1,
          myristic: 5,
          oleic: 45,
          palmitic: 12,
          ricinoleic: 6,
          stearic: 7
        });
      });

      it('Should load and save recipe 10 correctly', () => {
        // this is recipe 115 on soapee
        cy
          .visit('/recipes/10/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/10')
          .reload()
          .waitForQuery('commentableComments');

        assertOils([
          { oil: 'Castor Oil', ratio: '15', weight: '7.2', grams: '204.1' },
          { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '9.6', grams: '272.2' },
          { oil: 'Lard, Pig Tallow (Manteca)', ratio: '25', weight: '12', grams: '340.2' },
          { oil: 'Olive Oil', ratio: '20', weight: '9.6', grams: '272.2' },
          { oil: 'Stearic Acid', ratio: '20', weight: '9.6', grams: '272.2' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('18.24 ounces');
        assertTotalMixedNoahWeight('2.64 ounces');
        assertTotalKohWeight('6.18 ounces at 90% purity');
        assertTotalMixedLyeWeight('8.82 ounces');
        assertTotalOilWeight('48 ounces');
        assertTotalFragranceOilWeight('1.44 ounces');
        assertTotalBatchWeight('76.5 ounces');
        assertTotalSuperfat('6%');
        assertTotalLyeConcentration('32.61%');
        assertTotalWaterLyeRation('2.067 : 1');
        // FIXME double check ratio calcs
        //assertTotalSaturatedRatio('50 : 51');

        assertRecipeProperties({
          bubbly: 27,
          cleansing: 14,
          condition: 46,
          hardness: 50,
          longevity: 36,
          stable: 49,
          iodine: 47,
          ins: 161
        });

        assertFattyAcids({
          lauric: 10,
          linoleic: 5,
          myristic: 4,
          oleic: 28,
          palmitic: 12,
          ricinoleic: 14,
          stearic: 24
        });
      });
    });

    context('User 2', () => {
      beforeEach(() => cy.loginUser2());

      it('Should load and save recipe 11 correctly', () => {
        // recipe 476 on soapee
        cy
          .visit('/recipes/11/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/11')
          .reload()
          .waitForQuery('recipe');

        assertOils([
          { oil: 'Avocado Oil', ratio: '8', weight: '1', grams: '28.3' },
          { oil: 'Cocoa Butter', ratio: '25', weight: '3', grams: '85' },
          { oil: 'Coconut Oil, 76 deg', ratio: '8', weight: '1', grams: '28.3' },
          { oil: 'Tallow Beef', ratio: '58', weight: '7', grams: '198.4' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('5.22 ounces');
        assertTotalMixedNoahWeight('0.57 ounces');
        assertTotalKohWeight('1.66 ounces at 90% purity');
        assertTotalMixedLyeWeight('2.24 ounces');
        assertTotalOilWeight('12 ounces');
        assertTotalFragranceOilWeight('0.36 ounces');
        assertTotalBatchWeight('19.82 ounces');
        assertTotalSuperfat('5%');
        assertTotalLyeConcentration('30%');
        assertTotalNaohKohRatio('35% / 65%');
        assertTotalWaterLyeRation('2.333 : 1');
        assertTotalSaturatedRatio('58 : 43');

        assertRecipeProperties({
          bubbly: 10,
          cleansing: 10,
          condition: 40,
          hardness: 58,
          longevity: 47,
          stable: 47,
          iodine: 44,
          ins: 155
        });

        assertFattyAcids({
          lauric: 5,
          linoleic: 4,
          linolenic: 1,
          myristic: 5,
          oleic: 35,
          palmitic: 26,
          stearic: 22
        });
      });

      it('Should load and save recipe 12 correctly', () => {
        // recipe 511 on soapee
        cy
          .visit('/recipes/12/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/12')
          .reload()
          .waitForQuery('recipe');

        assertOils([
          { oil: 'Almond Oil, sweet', ratio: '25', weight: '75' },
          { oil: 'Castor Oil', ratio: '15', weight: '45' },
          { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '60' },
          { oil: 'Corn Oil', ratio: '30', weight: '90' },
          { oil: 'Tallow Beef', ratio: '10', weight: '30' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('114 grams');
        assertTotalNaohWeight('67.6 grams at 90% purity');
        assertTotalOilWeight('300 grams');
        assertTotalFragranceOilWeight('9 grams');
        assertTotalBatchWeight('490.6 grams');
        assertTotalSuperfat('1%');
        assertTotalLyeConcentration('37.2%');
        assertTotalWaterLyeRation('1.687 : 1');
        assertTotalSaturatedRatio('28 : 72');

        assertRecipeProperties({
          bubbly: 28,
          cleansing: 14,
          condition: 68,
          hardness: 28,
          longevity: 13,
          stable: 27,
          iodine: 79,
          ins: 126
        });

        assertFattyAcids({
          lauric: 10,
          linoleic: 21,
          myristic: 4,
          oleic: 33,
          palmitic: 10,
          ricinoleic: 14,
          stearic: 3
        });
      });

      it('Should load and save recipe 13 correctly', () => {
        // recipe 2825 on soapee
        cy
          .visit('/recipes/13/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/13')
          .reload()
          .waitForQuery('recipe');

        assertOils([
          { oil: 'Coconut Oil, 76 deg', ratio: '20', weight: '380' },
          { oil: 'Grapeseed Oil', ratio: '5', weight: '95' },
          { oil: 'Lard, Pig Tallow (Manteca)', ratio: '50', weight: '950' },
          { oil: 'Safflower Oil, high oleic', ratio: '20', weight: '380' },
          { oil: 'Shea Butter', ratio: '5', weight: '95' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('559 grams');
        assertTotalNaohWeight('279.5 grams');
        assertTotalOilWeight('1,900 grams');
        assertTotalFragranceOilWeight('57 grams');
        assertTotalBatchWeight('2,795.5 grams');
        assertTotalSuperfat('0%');
        assertTotalLyeConcentration('33.3%');
        assertTotalWaterLyeRation('2 : 1');
        assertTotalSaturatedRatio('41 : 59');

        assertRecipeProperties({
          bubbly: 14,
          cleansing: 14,
          condition: 54,
          hardness: 41,
          longevity: 27,
          stable: 27,
          iodine: 59,
          ins: 150
        });

        assertFattyAcids({
          lauric: 10,
          linoleic: 10,
          myristic: 4,
          oleic: 43,
          palmitic: 17,
          stearic: 10
        });
      });

      it('Should load and save recipe 14 correctly', () => {
        // recipe 3377 on soapee
        cy
          .visit('/recipes/14/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .url().should('contain', '/recipes/14')
          .reload()
          .waitForQuery('commentableComments');

        assertOils([
          { oil: 'Castor Oil', ratio: '18', weight: '4.5', grams: '127.6' },
          { oil: 'Cocoa Butter', ratio: '9', weight: '2.3', grams: '65.2' },
          { oil: 'Coconut Oil, 76 deg', ratio: '25.7', weight: '6.3', grams: '178.6' },
          { oil: 'Soybean, fully hydrogenated (soy wax)', ratio: '46.7', weight: '11.46', grams: '324.9' }
        ]);

        cy.get('.accordion:contains("Recipe Details")').click();

        assertTotalWaterWeight('13.48 ounces');
        assertTotalMixedNoahWeight('1.35 ounces');
        assertTotalKohWeight('3.15 ounces at 90% purity');
        assertTotalMixedLyeWeight('4.49 ounces');
        assertTotalOilWeight('24.56 ounces');
        assertTotalFragranceOilWeight('0.74 ounces');
        assertTotalBatchWeight('43.27 ounces');
        assertTotalSuperfat('7%');
        assertTotalLyeConcentration('25%');
        assertTotalNaohKohRatio('40% / 60%');
        assertTotalWaterLyeRation('3 : 1');
        assertTotalSaturatedRatio('72 : 28');

        assertRecipeProperties({
          bubbly: 34,
          cleansing: 17,
          condition: 24,
          hardness: 72,
          longevity: 55,
          stable: 71,
          iodine: 22,
          ins: 187
        });

        assertFattyAcids({
          lauric: 12,
          linoleic: 2,
          myristic: 5,
          oleic: 6,
          palmitic: 10,
          ricinoleic: 16,
          stearic: 44
        });
      });

      it('Should set image on recipe', () => {
        cy
          .visit('/recipes/14/edit')
          .waitForQuery('recipeForEditClone')

          .get('button:contains("Load Recipe image")').click()
          .get('[data-cy=recipe-image-upload-input]').attachFile('images/recipe-image.png')
          .get('button:contains("Save Image")').click()
          .get('button:contains("Load Recipe image")').should('be.visible')

          .get('button:contains("Save Recipe")').click()
          .url().should('contain', '/recipes/14')

          .get('[data-cy=recipe-image] img').should('exist')
          .get('[data-cy=recipe-image] img').invoke('attr', 'src')
          .should('contain', 'imageables/recipes/000/000/002')

          .pushHistory('/recipes/14/edit')
          .waitForQuery('recipeForEditClone')

          .get('img[data-cy=cropped-review-recipe-image]').should('exist')
          // test that saving recipe again doesn't clear image
          .get('button:contains("Save Recipe")').click()
          .url().should('contain', '/recipes/14')
          .get('[data-cy=recipe-image] img').should('exist')
          .get('[data-cy=recipe-image] img').invoke('attr', 'src')
          .should('contain', 'imageables/recipes/000/000/002');
      });

      it('Should clear image on recipe', () => {
        cy
          .visit('/recipes/14/edit')
          .waitForQuery('recipeForEditClone')

          .get('button:contains("Load Recipe image")').click()
          .get('[data-cy=recipe-image-upload-input]').attachFile('images/recipe-image.png')
          .get('button:contains("Save Image")').click()
          .get('button:contains("Load Recipe image")').should('be.visible')

          .get('button:contains("Save Recipe")').click()
          .url().should('contain', 'http://localhost:5000/recipes/14')
          .visit('/recipes/14/edit')

          .get('img[data-cy=cropped-review-recipe-image]').should('exist')
          .get('button:contains("Clear Image")').click()
          .get('img[data-cy=cropped-review-recipe-image]').should('not.exist')
          .get('button:contains("Save Recipe")').click()

          .url().should('equal', 'http://localhost:5000/recipes/14')
          .get('[data-cy=recipe-image] img').should('not.exist')

          .visit('/recipes/14/edit')
          .url().should('contain', 'http://localhost:5000/recipes/14/edit')
          .get('img[data-cy=cropped-review-recipe-image]').should('not.exist');
      });

      it('Should save recipe 14 as a copy', () => {
        // recipe 3377 on soapee
        cy
          .visit('/recipes/14/edit')
          .waitForQuery('recipeForEditClone')
          .get('button:contains("Save as Copy")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .waitForQuery('commentableComments')
              .url().should('contain', `/recipes/${recipeId}`)
              .reload()
              .waitForQuery('recipe');

            assertOils([
              { oil: 'Castor Oil', ratio: '18', weight: '4.5', grams: '127.6' },
              { oil: 'Cocoa Butter', ratio: '9', weight: '2.3', grams: '65.2' },
              { oil: 'Coconut Oil, 76 deg', ratio: '25.7', weight: '6.3', grams: '178.6' },
              { oil: 'Soybean, fully hydrogenated (soy wax)', ratio: '46.7', weight: '11.46', grams: '324.9' }
            ]);

            cy.get('.accordion:contains("Recipe Details")').click();

            assertTotalWaterWeight('13.48 ounces');
            assertTotalMixedNoahWeight('1.35 ounces');
            assertTotalKohWeight('3.15 ounces at 90% purity');
            assertTotalMixedLyeWeight('4.49 ounces');
            assertTotalOilWeight('24.56 ounces');
            assertTotalFragranceOilWeight('0.74 ounces');
            assertTotalBatchWeight('43.27 ounces');
            assertTotalSuperfat('7%');
            assertTotalLyeConcentration('25%');
            assertTotalNaohKohRatio('40% / 60%');
            assertTotalWaterLyeRation('3 : 1');
            assertTotalSaturatedRatio('72 : 28');

            assertRecipeProperties({
              bubbly: 34,
              cleansing: 17,
              condition: 24,
              hardness: 72,
              longevity: 55,
              stable: 71,
              iodine: 22,
              ins: 187
            });

            assertFattyAcids({
              lauric: 12,
              linoleic: 2,
              myristic: 5,
              oleic: 6,
              palmitic: 10,
              ricinoleic: 16,
              stearic: 44
            });

            cy
              .pushHistory('/settings/recipes')
              .waitForQuery('myRecipes')

              .get('[data-cy=recipe-summary]:first:contains("Shaving")').should('exist')
              .get('[data-cy=recipe-summary]:first .time-ago:contains("minute")').should('exist');
          });
      });

      it('Should not copy best status from a recipe', () => {
        cy
          .visit('/recipes/18/edit')
          .waitForQuery('recipeForEditClone')
          .get('input[name=name]').type(' copy')
          .get('button:contains("Save as Copy")').click()
          .waitForQuery('createRecipe')
          .waitForQuery('recipe')

          .loginUser1()
          .visit('/recipes')
          .waitForQuery('recipes')
          .get('.recipe:first').contains('Master With Lard copy').should('not.exist')
          .get('[data-cy=recipe-summary]:contains("Master With Lard copy") [data-cy=best-button]')
          .should('not.have.class', 'active');
      });
    });
  });

  context('Admin user', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb().loginUser1());

      it('Should mark a recipe as best', () => {
        cy
          .visit('/recipes/17')
          .waitForQuery('recipe')

          .get('[data-cy=best-button]').should('not.have.class', 'active').click()
          .waitForQuery('toggleBestRecipe')
          .get('[data-cy=best-button]').should('have.class', 'active')
          .reload()
          .waitForQuery('recipe')

          .get('[data-cy=best-button]').should('have.class', 'active').click()
          .waitForQuery('toggleBestRecipe')
          .get('[data-cy=best-button]').should('not.have.class', 'active')
          .reload()
          .waitForQuery('recipe')
          .get('[data-cy=best-button]').should('not.have.class', 'active');
      });
    });
  });

  context('Non admin user', () => {
    context('Queries', () => {
      before(() => cy.resetDb());
      beforeEach(() => cy.loginUser2());

      it('Should not see the best button on a recipe', () => {
        cy
          .visit('/recipes/17')
          .waitForQuery('recipe')
          .get('[data-cy=best-button]').should('not.exist');
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb().loginUser2());

      it('Should show reactions and update them', () => {
        cy
          .visit('/recipes/17')
          .waitForQuery('recipe')

          .get('[data-cy=reactions]').should('exist')
          .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
          .get('[data-cy=reactions] [data-cy=add-reaction]').should('exist').click()

          .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
          .waitForQuery('toggleReaction')
          .waitForQuery('recipe')

          .get('[data-cy=reaction-emoji-picker]').should('not.exist')
          .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
          .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine')
          .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("2")').should('exist').click()
          .waitForQuery('toggleReaction')
          .waitForQuery('recipe')

          .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('not.have.class', 'mine')
          .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("2")').should('not.exist')
          .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("1")').should('exist');
      });
    });
  });
});
