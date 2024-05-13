describe('Recipes', () => {
  context('Recipe Journals', () => {
    context('Anonymous users', () => {
      context('Querying', () => {
        before(() => cy.resetDb());

        context('Viewing Recipe Journals - recipe 2', () => {
          beforeEach(() => cy.visit('/recipes/2'));

          it('Should load recipe journals', () => {
            cy
              .waitForQuery('recipe')
              .get('[data-cy=comments-and-journals-section] a:contains("Journal")').click()
              .waitForQuery('recipeJournals')

              .get('[data-cy=recipe-journal]').its('length').should('be.above', 0)
              .get('[data-cy=recipe-journal]:first')
              .within(() => {
                cy
                  .get('[data-cy=sub-title]:contains("ago")').should('exist')
                  .get('[data-cy=rich-message]:contains("entry 12")').should('exist')
                  .get('button:contains("Edit")').should('not.exist');
              });
          });
        });
      });
    });

    context('User1', () => {
      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1());

        it('Should edit a recipe journal', () => {
          cy
            .visit('/recipes/2')
            .waitForQuery('recipe')
            .get('[data-cy=comments-and-journals-section] a:contains("Journal")').click()
            .waitForQuery('recipeJournals')

            .get('[data-cy=recipe-journal]').its('length').should('be.above', 0)
            .get('[data-cy=recipe-journal]:first')
            .within(() => {
              cy
                .get('button:contains("Edit")').click()
                .get('button:contains("Edit")').should('not.exist')
                .get('button:contains("Cancel")').should('exist')
                .get('button:contains("Update")').should('exist')

                .get('button:contains("Cancel")').click()
                .get('button:contains("Cancel")').should('not.exist')
                .get('button:contains("Update")').should('not.exist')
                .get('button:contains("Edit")').click()

                .setTinyMceContent('recipe-journal-1', 'updated recipe journal')
                .get('button:contains("Update")').click()
                .waitForQuery('updateRecipeJournal')

                .get('[data-cy=rich-message]:contains("updated recipe journal")').should('exist')
                .get('[data-cy=sub-title]:contains("minute")').should('exist')
                .get('button:contains("Edit")').should('exist')
                .get('button:contains("Cancel")').should('not.exist')
                .get('button:contains("Update")').should('not.exist');
            });
        });

        it('Should should add another recipe journal', () => {
          cy
            .visit('/recipes/2')
            .waitForQuery('recipe')
            .get('[data-cy=comments-and-journals-section] a:contains("Journal")').click()
            .waitForQuery('recipeJournals')

            .setTinyMceContent('create-recipe-journal', 'Brand new recipe journal')
            .get('button:contains("Create Journal")').click()
            .waitForQuery('createRecipeJournal')
            .get('[data-cy=recipe-journal]').its('length').should('equal', 2)

            .get('[data-cy=recipe-journal]:first')
            .within(() => {
              cy
                .get('[data-cy=sub-title]:contains("minute")').should('exist')
                .get('[data-cy=rich-message]:contains("Brand new recipe journal")').should('exist');
            });
          });
      });
    });
  });

});
