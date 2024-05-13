describe('Forums', () => {
  context('List', () => {
    context('Not logged in', () => {
      beforeEach(() => cy.resetDb().visit('/forums/home'));

      it('Should show official forums', () => {
        cy
          .get('[data-cy=official-forums] .forums-table tr')
          .its('length')
          .should('equal', 4);
      });

      it('Should show popular forums - dont include official forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("Popular")').click()
          .waitForQuery('forums')

          .get('[data-cy=popular-forums]')
          .within(() => {
            cy
              .get('[data-cy=forum-summary-row]').its('length').should('equal', 3)
              .get('[data-cy=forum-summary-row]:contains("announcements")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("features")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("official_forum")').should('not.exist');
          });
      });

      it('Should show recent forums - dont include official forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("Recent")').click()
          .waitForQuery('forums')

          .get('[data-cy=recent-forums]')
          .within(() => {
            cy
              .get('[data-cy=forum-summary-row]').its('length').should('equal', 3)
              .get('[data-cy=forum-summary-row]:contains("announcements")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("features")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("official_forum")').should('not.exist');
          });
      });

      it('Should show all forums - dont include official forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("All")').click()
          .waitForQuery('forums')

          .get('[data-cy=all-forums]')
          .within(() => {
            cy
              .get('[data-cy=forum-summary-row]').its('length').should('equal', 3)
              .get('[data-cy=forum-summary-row]:contains("announcements")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("features")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("official_forum")').should('not.exist');
          });
      });

      it('Should not show non-signed in forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("Subscribed Forums")').should('not.exist')
          .get('a.item:contains("My Forums")').should('not.exist');
      });

      it('Should show a login modal on CTA links', () => {
        cy
          .waitForQuery('forums')
          .get('[data-cy=create-perfect-forum] [data-cy=login-modal-link]')
          .click()

          .get('.modals')
          .should('exist')
          .and('be.visible');
      });

      it('Should handle all forum correctly', () => {
        cy
          .waitForQuery('forums')
          .get('[data-cy=forum-summary-row]:contains("all")')
          .within(() => {
            cy
              .get('[data-cy=last-post]').should('not.exist')
              .get('[data-cy=most-recent-post]').should('not.exist')
              .get('[data-cy=forum-stats]').should('not.exist');
          });
      });
    });

    context('Logged in', () => {
      beforeEach(() => cy.resetDb().loginUser1().visit('/forums/home'));

      it('Should show subscribed forums - dont include official forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("Subscribed Forums")').click()
          .waitForQuery('forums')

          .get('[data-cy=subscribed-forums]')
          .within(() => {
            cy
              .get('[data-cy=forum-summary-row]').its('length').should('equal', 2)
              .get('[data-cy=forum-summary-row]:contains("announcements")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("features")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("official_forum")').should('not.exist');
          });
      });

      it('Should show my forums - dont include official forums', () => {
        cy
          .waitForQuery('forums')
          .get('a.item:contains("My Forums")').click()
          .waitForQuery('forums')

          .get('[data-cy=my-forums]')
          .within(() => {
            cy
              .get('[data-cy=forum-summary-row]').its('length').should('equal', 2)
              .get('[data-cy=forum-summary-row]:contains("announcements")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("features")').should('not.exist')
              .get('[data-cy=forum-summary-row]:contains("official_forum")').should('not.exist');
          });
      });
    });
  });

});
