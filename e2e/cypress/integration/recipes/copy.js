describe('Recipes', () => {
  context('Copying recipes', () => {

    context('User1', () => {
      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1());

        it('Should copy a recipe and record from-recipe-id', () => {
          cy
            .visit('/recipes/2')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-copy]').click()
            .get('button:contains("Copy Recipe")').click()
            .waitForQuery('createRecipe')
            .waitForQuery('recipe')

            .get('[data-cy=copied-from]:contains("Lavender")').should('exist')
            .get('[data-cy=copied-from] a').invoke('attr', 'href').should('contain', '/recipes/2');
        });

        it('Should copy a recipe with additives correctly', () => {
          cy
            .visit('/recipes/20')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-copy]').click()
            .get('button:contains("Copy Recipe")').click()
            .waitForQuery('createRecipe')
            .waitForQuery('recipe')

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

        it('Should copy a recipe with additives from another user correctly', () => {
          cy
            .visit('/recipes/11')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-copy]').click()
            .get('button:contains("Copy Recipe")').click()
            .waitForQuery('createRecipe')
            .waitForQuery('recipe')

            .get('[data-cy=additives-breakdown]')
            .within(() => {
              cy
                .get('[data-cy=recipe-comps-additive-row]:contains("garlic")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("garlic") [data-cy=recipe-comps-additive-row-measure]:contains("1 clove")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("salt")').should('exist')
                .get('[data-cy=recipe-comps-additive-row]:contains("garlic") [data-cy=recipe-comps-additive-row-name] a')
                .invoke('attr', 'href').should('contain', '/settings/additives/5');
            });

        });
      });
    });
  });
});
