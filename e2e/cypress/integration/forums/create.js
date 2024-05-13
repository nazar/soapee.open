describe('Forums', () => {

  context('Create', () => {
    context('Not logged in', () => {
      before(() => cy.resetDb());

      it('Should not display forum post for anon users', () => {
        cy
          .visit('/forums/1')
          .waitForQuery('forum')

          .get('[data-cy=form-post]').should('not.exist');
      });
    });

    context('Logged in', () => {
      context('Queries', () => {
        before(() => cy.resetDb());
        beforeEach(() => cy.loginUser1());

        it('Should display validation messages correctly', () => {
          cy
            .visit('/forums/create')

            .get('.form-field-error-message').should('not.exist')
            .get('input[name=name]').type('aa', { delay: 1 })
            .get('.form-field-error-message:contains("Forum Name must be at least 3")').should('exist')

            .get('input[name=name]').type('{selectall}testforum', { delay: 1 })
            .waitForQuery('forumExists')
            .get('.form-field-error-message:contains("Forum Name must be at least 3")').should('not.exist')
            .get('.form-field-error-message:contains("testforum already exists")').should('exist')

            .get('[data-cy=forum-summary]').type('aa', { delay: 1 })
            .get('.form-field-error-message:contains("Forum Summary must be at least 10")').should('exist')

            .setTinyMceContent('forum-banner', 'aa')
            .wait(500)
            .get('.form-field-error-message:contains("Forum Banner must be at least 10")').should('exist')

            .get('button:contains("Create Forum")').should('be.disabled');
        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1().visit('/forums/create'));

        it('Should Create a forum', () => {
          cy
            .get('input[name=name]').type('new_forum_test', { delay: 1 })
            .get('[data-cy=forum-summary]').type('forum summary goes here', { delay: 1 })
            .setTinyMceContent('forum-banner', 'forum banner test')

            .get('[data-cy=add-forum-input] input').type('tag 1')
            .get('[data-cy=add-forum-button]').click()
            .get('[data-cy=add-forum-input] input').should('have.value', '')
            .get('[data-cy=add-forum-input] input').type('tag 2')
            .get('[data-cy=add-forum-button]').click()

            .get('[data-cy=forum-tags]:contains("tag 1")').should('exist')
            .get('[data-cy=forum-tags]:contains("tag 2")').should('exist')

            .get('[data-cy=forum-tags] tr:last [data-cy=remove-tag]').click()
            .get('[data-cy=forum-tags]:contains("tag 2")').should('not.exist')

            .get('button:contains("Create Forum")').should('not.be.disabled').click()
            .waitForQuery('createForum')
            .its('request.body')
            .should(({ variables: { input } }) => {
              expect(input.name).to.equal('new_forum_test');
              expect(input.forumType).to.equal('public');
              expect(input.banner).to.equal('<p>forum banner test</p>');
              expect(input.summary).to.equal('forum summary goes here');
            });
        });
      });
    });
  });
});
