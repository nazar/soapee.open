describe('Oils', () => {

  context('View', () => {

    context('Queries', () => {
      before(() => cy.resetDb());

      context('Logged in', () => {
        beforeEach(() => cy.loginUser1());

        it('Should view oil', () => {
          cy
            .visit('/oils/1')
            .waitForQuery('oil')

            .get('[data-cy=breakdown-row]:contains("Linoleic")').should('contain', '11%')
            .get('[data-cy=breakdown-row]:contains("Linolenic")').should('contain', '4%')
            .get('[data-cy=breakdown-row]:contains("Oleic")').should('contain', '18%')
            .get('[data-cy=breakdown-row]:contains("Palmitic")').should('contain', '3%')
            .get('[data-cy=breakdown-row]:contains("Stearic")').should('contain', '2%')

            .get('[data-cy=saturation-row]:contains("Saturated")').should('contain', '5%')
            .get('[data-cy=saturation-row]:contains("Mono-unsaturated")').should('contain', '18%')
            .get('[data-cy=saturation-row]:contains("Poly-unsaturated")').should('contain', '11%');
        });

        it('Should show oil acid breakdown', () => {
          cy
            .visit('/oils/72')
            .waitForQuery('oil')

            .get('[data-cy=breakdown-row]:contains("Docosadienoic")').parent().get('td:contains("18%")').should('exist')
            .get('[data-cy=breakdown-row]:contains("Docosenoid")').parent().get('td:contains("16%")').should('exist')
            .get('[data-cy=breakdown-row]:contains("Eicosenoic")').parent().get('td:contains("61%")').should('exist')
            .get('[data-cy=oil-property]:contains("Condition")').get('td:contains("95")').should('exist');
        });
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Logged in', () => {
        beforeEach(() => cy.loginUser1().visit('/oils/1'));

        it('Should be able to post', () => {
          cy
            .waitForQuery('oil')

            .get('[data-cy=create-postable-post]')
            .within(() => {
              cy
                .get('input[name=title]').type('oil related post')
                .setTinyMceContent('new-content', 'oil related post details')
                .get('button:contains("Post")').click()
                .waitForQuery('createPost');
            })

            .get('[data-cy=post]').its('length').should('equal', 2)
            .get('input[name=title]').should('have.value', '')
            .getTinyMceContent('new-content').should('be.empty');
        });
      });
    });
  });

});
