describe('Authentication', () => {

  context('Logout', () => {

    context('Mutations', () => {
      beforeEach(() => cy.resetDb().loginUser1());

      it('Should clear the cache on logout', () => {
        cy
          .visit('/settings')
          .get('input[name=name]').should('have.value', 'Nazar Aziz')
          .get('[data-cy=user-menu-item]').click()
          .get('[data-cy=logout]').click()

          .pushHistory('/auth/login')
          .get('input[name=username]').type('aziz')
          .get('input[name=password]').type('password')
          .get('button:contains("Login")').click()
          .waitForQuery('localUserLogin')

          .url().should('contain', '/settings')
          .get('input[name=name]').should('have.value', 'Aziz Nazar');
      });
    });
  });
});
