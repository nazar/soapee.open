describe('Notifications', () => {
  context('Commenting', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Recipes', () => {
        beforeEach(() => cy.loginUser1());

        it('Should not show notification on my comments', () => {
          cy
            .visit('/recipes/1')
            .waitForQuery('recipe')

            .setTinyMceContent('add-commentable-comment', 'this is my comment')
            .get('button:contains("Comment")').click()
            .waitForQuery('createComment')

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('not.exist');
        });

        it('Should notify recipe owner when their recipe is commented', () => {
          cy
            .visit('/recipes/18')
            .waitForQuery('recipe')

            .setTinyMceContent('add-commentable-comment', 'this is my comment')
            .get('button:contains("Comment")').click()
            .waitForQuery('createComment')

            .loginUser3()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]:contains("1")').should('exist')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Nazar Aziz")').should('exist')
                .get('[data-cy-target=recipes]').should('exist').and('contain', 'Recipe')
                .get('[data-cy-target=recipes]').invoke('attr', 'href').should('contains', '/recipes/18')
                .get('[data-cy=comment-text]:contains("this is my comment")').should('exist');
            })
            .get('[data-cy=notification-count]:contains("1")').should('not.exist')
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]').should('not.exist')
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications] [data-cy=notification-item]').its('length').should('equal', 1);
        });
      });

      context('Posts', () => {
        it('Should notify post owner when post is commented', () => {
          cy
            .loginUser3()
            .visit('/posts/5')
            .waitForQuery('commentableComments')

            .setTinyMceContent('add-commentable-comment', 'this is my comment')
            .get('button:contains("Comment")').click()
            .waitForQuery('createComment')

            .loginUser1()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Stranger Danger")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/3')
                .get('[data-cy-target=posts]').should('exist').and('contain', 'Post')
                .get('[data-cy-target=posts]').invoke('attr', 'href').should('contains', '/posts/5')
                .get('[data-cy=comment-text]:contains("this is my comment")').should('exist');
            });
        });
      });
    });
  });
});
