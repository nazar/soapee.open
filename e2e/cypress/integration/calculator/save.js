import {
  selectOilAndSetWeight
} from '../../utils/calculatorHelpers';

describe('Calculator', () => {

  context('Creating Recipes', () => {
    beforeEach(() => cy.resetDb());

    context('Anonymous users', () => {
      it('Should create a recipe - login first', () => {
        cy
          .visit('/calculator')
          .waitForQuery('oils')

          .get('[data-cy=list-oil-weights-segment] .message:contains("At least one Oil is required")').should('exist')
          .get('[data-cy=list-oil-weights-segment] .message:contains("Oils weights must be above 0")').should('not.exist')

          .get('[data-cy=soap-type-naoh]').click()
          .get('[data-cy=uom-grams]').click()
          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[data-cy=superfat-input]').type('{selectall}5');

        selectOilAndSetWeight('Cocoa Butter', '70');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '557');

        cy
          .get('[data-cy=recipe-name] input').type('name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')
          .get('button:contains("Save Recipe")').click()

          .get('[data-cy=login-signup-modal]')
          .within(() => {
            cy
              .get('input[name=username]').type('nazar')
              .get('input[name=password]').type('password')
              .get('button:contains("Login")').click()
              .waitForQuery('localUserLogin')
              .wait(2000);
          })

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe');
      });

      it('Should create a recipe - signup first', () => {
        cy
          .visit('/calculator')
          .waitForQuery('oils')

          .get('[data-cy=list-oil-weights-segment] .message:contains("At least one Oil is required")').should('exist')
          .get('[data-cy=list-oil-weights-segment] .message:contains("Oils weights must be above 0")').should('not.exist')

          .get('[data-cy=soap-type-naoh]').click()
          .get('[data-cy=uom-grams]').click()
          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[data-cy=superfat-input]').type('{selectall}5');

        selectOilAndSetWeight('Cocoa Butter', '70');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '557');

        cy
          .get('[data-cy=recipe-name] input').type('name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')
          .get('button:contains("Save Recipe")').click()

          .get('[data-cy=login-signup-modal]')
          .within(() => {
            cy
              .get('[data-cy=auth-method] [data-cy=signup]').click()
              .get('input[name=username]').type('nazarr')
              .get('input[name=password]').type('passwordd')
              .get('button:contains("Signup")').click()
              .waitForQuery('localSignup');
          })

          .get('[data-cy=login-signup-modal]').should('not.exist')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe');
      });

      it('Should show additives CTA when not logged in', () => {
        cy
          .visit('/calculator')
          .waitForQuery('oils')

          .get('[data-cy=login-for-additives]').should('exist')
          .within(() => {
            cy
              .get('[data-cy=login]').click();
          })
          .get('[data-cy=login-signup-modal]')
          .within(() => {
            cy
              .get('[data-cy=auth-method] [data-cy=signup]').click()
              .get('input[name=username]').type('nazarr')
              .get('input[name=password]').type('passwordd')
              .get('button:contains("Signup")').click()
              .waitForQuery('localSignup');
          })
          .get('[data-cy=login-for-additives]').should('not.exist')

          .get('[data-cy=additive-input-filter]').type('vanilla')
          .get('[data-cy=create-additive]').click()
          .waitForQuery('createAdditive')
          .waitForQuery('additives')

          .get('[data-cy=additive-select-row]:contains("vanilla") [data-cy=add-additive]').click()
          .get('[data-cy=additive-selected-row]:contains("vanilla")').should('exist')
          .get('[data-cy=additive-selected-row]:contains("vanilla") [data-cy=remove-additive]').click()
          .get('[data-cy=additive-selected-row]:contains("vanilla")').should('not.exist')

          .get('[data-cy=additive-select-row]:contains("vanilla") [data-cy=add-additive]').click();

        selectOilAndSetWeight('Cocoa Butter', '70');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')
          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe');
      });
    });

    context('Logged in users', () => {
      beforeEach(() => cy.loginUser1().visit('/calculator'));

      it('Should create a recipe', () => {
        cy
          .waitForQuery('oils')

          .get('[data-cy=list-oil-weights-segment] .message:contains("At least one Oil is required")').should('exist')
          .get('[data-cy=list-oil-weights-segment] .message:contains("Oils weights must be above 0")').should('not.exist')

          .get('[data-cy=soap-type-naoh]').click()
          .get('[data-cy=uom-grams]').click()
          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[data-cy=superfat-input]').type('{selectall}5');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .url().should('contain', `/recipes/${recipeId}`);
          });
      });

      it('Should save and edit recipe by unit dimensions - box', () => {
        cy
          .waitForQuery('oils')

          .get('[data-cy=soap-type-naoh]').click()

          .get('[data-cy=units-by-dimension]').click()
          .get('[data-cy=units-of-measure]')
          .within(() => {
            cy
              .get('[data-cy=uom-dimension-type-box]').click()
              .get('[data-cy=uom-dimension-type-box-width]').type(10)
              .get('[data-cy=uom-dimension-type-box-height]').type(11)
              .get('[data-cy=uom-dimension-type-box-length]').type(12)
              .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '1,254');
          })

          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[data-cy=superfat-input]').type('{selectall}5');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .url().should('contain', `/recipes/${recipeId}`)
              .pushHistory(`/recipes/${recipeId}/edit`)

              .pushHistory(`/recipes/${recipeId}/edit`)
              .waitForQuery('recipeForEditClone')

              .get('[data-cy=units-by-dimension]').should('have.class', 'active')
              .get('[data-cy=units-of-measure]')
              .within(() => {
                cy
                  .get('[data-cy=uom-dimension-type-box-width]').should('have.value', '10')
                  .get('[data-cy=uom-dimension-type-box-height]').should('have.value', '11')
                  .get('[data-cy=uom-dimension-type-box-length]').should('have.value', '12')
                  .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '1,254');
              })

              .pushHistory(`/recipes/${recipeId}`)
              .waitForQuery('recipe')
              .pushHistory(`/recipes/${recipeId}/copy`)
              .waitForQuery('recipeForEditClone')

              .get('[data-cy=units-by-dimension]').should('have.class', 'active')
              .get('[data-cy=units-of-measure]')
              .within(() => {
                cy
                  .get('[data-cy=uom-dimension-type-box-width]').should('have.value', '10')
                  .get('[data-cy=uom-dimension-type-box-height]').should('have.value', '11')
                  .get('[data-cy=uom-dimension-type-box-length]').should('have.value', '12')
                  .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '1,254');
              });
          });
      });

       it('Should save and edit recipe by unit dimensions - cylinder', () => {
        cy
          .waitForQuery('oils')

          .get('[data-cy=soap-type-naoh]').click()

          .get('[data-cy=units-by-dimension]').click()
          .get('[data-cy=units-of-measure]')
          .within(() => {
            cy
              .get('[data-cy=uom-dimension-type-cylinder]').click()
              .get('[data-cy=uom-dimension-type-cylinder-height]').type(10)
              .get('[data-cy=uom-dimension-type-cylinder-diameter]').type(11)
              .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '902.8');
          })

          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[data-cy=superfat-input]').type('{selectall}5');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .url().should('contain', `/recipes/${recipeId}`)
              .pushHistory(`/recipes/${recipeId}/edit`)
              .waitForQuery('recipeForEditClone')

              .get('[data-cy=units-by-dimension]').should('have.class', 'active')
              .get('[data-cy=units-of-measure]')
              .within(() => {
                cy
                  .get('[data-cy=uom-dimension-type-cylinder] input').should('be.checked')
                  .get('[data-cy=uom-dimension-type-cylinder-height]').should('have.value', '10')
                  .get('[data-cy=uom-dimension-type-cylinder-diameter]').should('have.value', '11')
                  .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '902.8');
              })

              .pushHistory(`/recipes/${recipeId}`)
              .waitForQuery('recipe')
              .pushHistory(`/recipes/${recipeId}/copy`)
              .waitForQuery('recipeForEditClone')

              .get('[data-cy=units-by-dimension]').should('have.class', 'active')
              .get('[data-cy=units-of-measure]')
              .within(() => {
                cy
                  .get('[data-cy=uom-dimension-type-cylinder] input').should('be.checked')
                  .get('[data-cy=uom-dimension-type-cylinder-height]').should('have.value', '10')
                  .get('[data-cy=uom-dimension-type-cylinder-diameter]').should('have.value', '11')
                  .get('[data-cy=uom-dimension-type-total-weight]').should('have.value', '902.8');
              });
          });
      });

      it('Should create a recipe with negative superfat', () => {
        cy
          .waitForQuery('oils')

          .get('[data-cy=list-oil-weights-segment] .message:contains("At least one Oil is required")').should('exist')
          .get('[data-cy=list-oil-weights-segment] .message:contains("Oils weights must be above 0")').should('not.exist')

          .get('[data-cy=soap-type-naoh]').click()
          .get('[data-cy=uom-grams]').click()
          .get('[data-cy=amount-water-type-ratio]').click()
          .get('[data-cy=amount-water-type-ratio-input]').type('{selectall}38')
          .get('[name=superFat]').type('{selectall}-5');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .url().should('contain', `/recipes/${recipeId}`)
              .pushHistory(`/recipes/${recipeId}/edit`)
              .waitForQuery('recipeForEditClone')

              .get('input[name=superFat]').should('have.value', '-5');
          });
      });

      it.skip('Should adjust numeric values with up/down and shift/alt', () => {
        cy
          .waitForQuery('oils')

          .get('[name=superFat]').type('{uparrow}')
          .get('[name=superFat]').should('have.value', 6)
          .get('[name=superFat]').type('{shift}{uparrow}')
          .get('[name=superFat]').should('have.value', 16)
          .get('[name=superFat]').type('{alt}{uparrow}')
          .get('[name=superFat]').should('have.value', 116)
          .get('[name=superFat]').type('{downarrow}')
          .get('[name=superFat]').should('have.value', 115)
          .get('[name=superFat]').type('{shift}{downarrow}')
          .get('[name=superFat]').should('have.value', 105)
          .get('[name=superFat]').type('{alt}{downarrow}')
          .get('[name=superFat]').should('have.value', 5);

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.createRecipe.id;

            cy
              .url().should('contain', `/recipes/${recipeId}`)
              .pushHistory(`/recipes/${recipeId}/edit`)
              .waitForQuery('recipeForEditClone')

              .get('input[name=superFat]').should('have.value', '5');
          });
      });

      it('Should save recipe image when creating a recipe', () => {
        cy
          .waitForQuery('oils');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')
          .get('button:contains("Load Recipe image")').click()
          .get('[data-cy=recipe-image-upload-input]').attachFile('images/recipe-image.png')
          .get('button:contains("Save Image")').click()

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('recipe')
          .then((xhr) => {
            const recipeId = xhr.response.body.data.recipe.id;

            cy
              .url().should('equal', `http://localhost:5000/recipes/${recipeId}`)

              .get('[data-cy=recipe-image] img').should('exist')
              .get('[data-cy=recipe-image] img').invoke('attr', 'src')
              .should('contain', 'imageables/recipes/000/000/002');
          });
      });

      it('Should accept and preserve 0 value fragrance values', () => {
        cy
          .waitForQuery('oils');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('input[name=fragrance]').type('{selectall}0')
          .get('input[name=fragrancePpo]').type('{selectall}0')
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .waitForQuery('recipe')
          .get('.accordion:contains("Recipe Details")').click()

          .get('[data-cy=recipe-totals-total-fragrance-weight]:contains("0")').should('exist')
          .get('a:contains("Edit")').click()
          .waitForQuery('recipeForEditClone')

          .get('input[name=fragrance]').should('have.value', 0)
          .get('input[name=fragrancePpo]').should('have.value', 0);
      });

      it('Should calculate citric acid adjustments for solid soap recipe', () => {
        cy
          .waitForQuery('oils');

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=enable-citric-adjust]').click()
          .get('[data-cy=citric-adjust-percent]').type('{selectall}1')
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .waitForQuery('recipe')
          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-weight]:contains("5 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-lye-adjust]:contains("3.1 grams")').should('exist')

          .get('a:contains("Edit")').click()
          .waitForQuery('recipeForEditClone')

          .get('[data-cy=enable-citric-adjust] input').should('be.checked')
          .get('[data-cy=citric-adjust-percent]').should('have.value', 1)

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .waitForQuery('recipe')

          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-weight]:contains("5 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-lye-adjust]:contains("3.1 grams")').should('exist');
      });

      it('Should calculate citric acid adjustments for koh soap recipe', () => {
        cy
          .waitForQuery('oils')
          .get('[data-cy=soap-type-koh]').click();

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=enable-citric-adjust]').click()
          .get('[data-cy=citric-adjust-percent]').type('{selectall}1')
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .waitForQuery('recipe')
          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-weight]:contains("5 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-lye-adjust]:contains("4.2 grams")').should('exist')

          .get('a:contains("Edit")').click()
          .waitForQuery('recipeForEditClone')

          .get('[data-cy=enable-citric-adjust] input').should('be.checked')
          .get('[data-cy=citric-adjust-percent]').should('have.value', 1)

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .waitForQuery('recipe')

          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-weight]:contains("5 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-lye-adjust]:contains("4.2 grams")').should('exist');
      });

      it('Should calculate citric acid adjustments for hybrid soap recipe', () => {
        cy
          .waitForQuery('oils')
          .get('[data-cy=soap-type-mixed]').click();

        selectOilAndSetWeight('Cocoa Butter', '70.00');
        selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

        cy
          .get('[data-cy=enable-citric-adjust]').click()
          .get('[data-cy=citric-adjust-percent]').type('{selectall}1')
          .get('[data-cy=recipe-name] input').type('My Recipe Name')
          .setTinyMceContent('recipe-description', 'Recipe description')
          .setTinyMceContent('recipe-notes', 'Recipe notes')

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('createRecipe')
          .waitForQuery('recipe')
          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-koh-adjust]:contains("2.1 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-naoh-adjust]:contains("1.6 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-naoh-weight]:contains("37.6 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-koh-weight]:contains("58.3 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-lye-weight]:contains("95.9 grams")').should('exist')

          .get('a:contains("Edit")').click()
          .waitForQuery('recipeForEditClone')

          .get('[data-cy=enable-citric-adjust] input').should('be.checked')
          .get('[data-cy=citric-adjust-percent]').should('have.value', 1)

          .get('button:contains("Save Recipe")').click()
          .waitForQuery('updateRecipe')
          .waitForQuery('recipe')

          .get('.accordion:contains("Recipe Details")').click()
          .get('[data-cy=recipe-totals-mixed-citric-koh-adjust]:contains("2.1 grams")').should('exist')
          .get('[data-cy=recipe-totals-mixed-citric-naoh-adjust]:contains("1.6 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-naoh-weight]:contains("37.6 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-koh-weight]:contains("58.3 grams")').should('exist')
          .get('[data-cy=recipe-totals-total-mixed-lye-weight]:contains("95.9 grams")').should('exist');
      });
    });
  });
});
