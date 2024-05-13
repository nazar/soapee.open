describe('Forums', () => {
  context('Search', () => {
    context('Not logged in', () => {
      beforeEach(() => cy.resetDb().visit('/forums/search'));

      it('Should search forum posts', () => {
        cy
          .get('[data-cy=forum-search-form] input').type('lock')
          .get('[data-cy=forum-search-form] [data-cy=button-search]').click()
          .waitForQuery('searchForumPosts')

          .get('[data-cy=post]').its('length').should('equal', 2)
          .get('[data-cy-post-id=2]:first').should('exist')
          .get('[data-cy-post-id=4]:last').should('exist')

          .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
          .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
          .waitForQuery('searchForumPosts')

          .get('[data-cy-post-id=4]:first').should('exist')
          .get('[data-cy-post-id=2]:last').should('exist');
      });
    });
  });
});
