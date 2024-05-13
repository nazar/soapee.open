describe('Notifications', () => {
  context('Recipes', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Copying Recipes', () => {
        it('Should notify user when another user copies their recipe', () => {
          cy
            .loginUser5()
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-copy]').click()
            .waitForQuery('recipeForEditClone')
            .get('button:contains("Copy Recipe")').click()
            .waitForQuery('createRecipe')

            .loginUser1()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Forgot email")').should('exist')
                .get('[data-cy=notification-copied-recipe]').should('exist');
            });
        });

        it('Should not notify a user if they copy their own recipe', () => {
          cy
            .loginUser1()
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-copy]').click()
            .waitForQuery('recipeForEditClone')
            .get('button:contains("Copy Recipe")').click()
            .waitForQuery('createRecipe')

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('not.exist');
        });
      });

      context('Best Recipes', () => {
        it('Should notify recipe owner when their recipe is marked as best', () => {
          cy
            .loginUser1()
            .visit('/recipes')
            .waitForQuery('recipesSummary')

            .get('[data-cy-recipe-id=17]')
            .within(() => {
              cy
                .get('[data-cy=best-button]').click()
                .waitForQuery('toggleBestRecipe');
            })

            .loginUser3()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Nazar Aziz")').should('exist')
                .get('[data-cy=notification-best-recipe]').should('exist');
            });
        });
      });
    });
  });
});
