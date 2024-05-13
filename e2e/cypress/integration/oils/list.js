describe('Oils', () => {
  context('List', () => {
    context('Not logged in', () => {
      beforeEach(() => cy.resetDb().visit('/oils'));

      it('Should list oils', () => {
        cy
          .waitForQuery('oils')
          .get('[data-cy=oil-row]').its('length').should('be.above', 0);
      });

      it('Should filter oils', () => {
        cy
          .waitForQuery('oils')

          .get('[data-cy=filter-oils] input').type('aloe')
          .get('[data-cy=oil-row]').its('length').should('equal', 1)
          .get('[data-cy=oil-row]:contains("Aloe")').should('exist')

          .get('[data-cy=filter-oils] input').type('{esc}')
          .get('[data-cy=oil-row]').its('length').should('be.above', 1)
      });
    });
  });

});
