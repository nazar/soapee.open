describe('Forums', () => {

  context('Edit', () => {

    context('Logged in', () => {

      context('Queries', () => {
        before(() => cy.resetDb());
        beforeEach(() => cy.loginUser1());

        it('Should not allow editing others forums', () => {
          cy
            .visit('/forums/3')
            .waitForQuery('forum')
            .get('.button:contains("Edit Forum")').should('not.exist')

            .visit('/forums/3/edit')
            .waitForQuery('forumForEdit')

            .get('div:contains("Only the Forum owner can edit this Forum")').should('exist');

        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1());

        it('Should allow editing my own forums', () => {
          cy
            .visit('/forums/1')
            .waitForQuery('forum')

            .get('.button:contains("Edit Forum")').should('exist').click()
            .url().should('contain', 'forums/1/edit')

            .get('input[name=name]').should('not.exist')
            .get('[name=summary]:contains("this is the summary")').should('exist')
            .getTinyMceContent('forum-banner').should('contain', 'this is the banner')

            .get('[name=summary]').type('{selectall}this is the updated summary')
            .setTinyMceContent('forum-banner', 'this is the updated banner')

            .get('[data-cy=add-forum-input] input').type('tag 1')
            .get('[data-cy=add-forum-button]').click()
            .get('[data-cy=add-forum-input] input').should('have.value', '')
            .get('[data-cy=add-forum-input] input').type('tag 2')
            .get('[data-cy=add-forum-button]').click()

            .get('[data-cy=forum-tags]:contains("tag 1")').should('exist')
            .get('[data-cy=forum-tags]:contains("tag 2")').should('exist')

            .get('button:contains("Update Forum")').should('not.be.disabled').click()
            .waitForQuery('updateForum')

            .url().should('contain', 'forums/1')

            .get('[data-cy=forum-details]:contains("this is the updated banner")').should('exist')
            .get('[data-cy=bread] a:contains("Forums")').click()
            .url().should('contain', 'forums/home')
            .waitForQuery('forums')

            .get('[data-cy=forum-summary-row]:contains("testforum")')
            .within(() => {
              cy
                .get('[data-cy=forum-summary]:contains("this is the updated summary")').should('exist');
            })

            .pushHistory('/forums/1/edit')
            .waitForQuery('forumForEdit')
            .get('[data-cy=forum-tags]:contains("tag 1")').should('exist')
            .get('[data-cy=forum-tags]:contains("tag 2")').should('exist')

            .get('[data-cy=add-forum-input] input').type('tag 3')
            .get('[data-cy=add-forum-button]').click()
            .get('[data-cy=add-forum-input] input').should('have.value', '')

            .get('[data-cy=forum-tag-row]:contains("tag 1") [data-cy=select-color]').click()
            .get('[data-cy=forum-tag-row]:contains("tag 1") [role=option]:contains("Blue")').click()
            .get('[data-cy=forum-tag-row]:contains("tag 2") [data-cy=remove-tag]').click()
            .get('button:contains("Update Forum")').should('not.be.disabled').click()
            .waitForQuery('updateForum')
            .waitForQuery('forum')

            .pushHistory('/forums/1/edit')
            .waitForQuery('forumForEdit')
            .get('[data-cy=forum-tags]:contains("tag 1")').should('exist')
            .get('[data-cy=forum-tags]:contains("tag 2")').should('not.exist')
            .get('[data-cy=forum-tags]:contains("tag 3")').should('exist')

            .get('[data-cy=add-forum-input] input').type('Tag 3')
            .get('[data-cy=add-forum-button]').click()
            .get('[data-cy=add-forum-input] input').should('have.value', '')

            .get('[data-cy=form-field-error-message]:contains("Duplicate")').should('exist')
            .get('button:contains("Update Forum")').should('be.disabled')

            .get('[data-cy=forum-tag-row]:contains("tag 3") [data-cy=remove-tag]').click()
            .get('[data-cy=form-field-error-message]:contains("Duplicate")').should('not.exist')
            .get('button:contains("Update Forum")').should('not.be.disabled');
        });

        it('Should remove all tags from a forum', () => {
          cy
            .visit('/forums/1/edit')
            .waitForQuery('forumForEdit')

            .get('[data-cy=forum-tag-row]:first [data-cy=remove-tag]').click()
            .get('[data-cy=forum-tag-row]:first [data-cy=remove-tag]').click()
            .get('button:contains("Update Forum")').click()

            .waitForQuery('updateForum')
            .waitForQuery('forum')

            .pushHistory('/forums/1/edit')
            .waitForQuery('forumForEdit')

            .get('[data-cy=forum-tag-row] [data-cy=remove-tag]').should('not.exist')
        });
      });
    });
  });
});
