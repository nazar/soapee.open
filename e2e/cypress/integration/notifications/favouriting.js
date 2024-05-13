describe('Notifications', () => {
  context('Favouriting', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Recipes', () => {
        beforeEach(() => cy.loginUser1());

        it('Should not show notification on my favourites', () => {
          cy
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy=recipe]')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')
                .get('[data-cy=favourite-button]').should('have.class', 'active');
            })

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('not.exist');
        });

        it('Should notify recipe owner when their recipe is favourited', () => {
          cy
            .visit('/recipes/18')
            .waitForQuery('recipe')

            .get('[data-cy=recipe]')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')
                .get('[data-cy=favourite-button]').should('have.class', 'active');
            })

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
                .get('[data-cy-target=recipes]').invoke('attr', 'href').should('contains', '/recipes/18');
            })
            .get('[data-cy=notification-count]:contains("1")').should('not.exist')
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]').should('not.exist')
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications] [data-cy=notification-item]').its('length').should('equal', 1);
        });
      });

      context('Posts', () => {
        it('Should notify post owner when post is favourited', () => {
          cy
            .loginUser3()
            .visit('/posts/5')
            .waitForQuery('commentableComments')

            .get('[data-cy=post-detail]')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')
                .get('[data-cy=favourite-button]').should('have.class', 'active');
            })

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
                .get('[data-cy-target=posts]').invoke('attr', 'href').should('contains', '/posts/5');
            });
        });
      });

      context('Comments', () => {
        it('Should notify comment owner when post comment is favourited', () => {
          cy
            .loginUser3()
            .visit('/posts/1')
            .waitForQuery('commentableComments')

            .get('[data-cy-comment-id=8]')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')
                .get('[data-cy=favourite-button]').should('have.class', 'active');
            })

            .loginUser2()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Stranger Danger")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/3')
                .get('[data-cy-parent=comment]').should('exist').and('contain', 'Post')
                .get('[data-cy-parent=comment]').invoke('attr', 'href').should('contains', '/posts/1');
            });
        });

        it('Should notify comment owner when recipe comment is favourited', () => {
          cy
            .loginUser3()
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy-comment-id=11]')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')
                .get('[data-cy=favourite-button]').should('have.class', 'active');
            })

            .loginUser1()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Stranger Danger")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/3')
                .get('[data-cy-parent=comment]').should('exist').and('contain', 'Recipe')
                .get('[data-cy-parent=comment]').invoke('attr', 'href').should('contains', '/recipes/10');
            });
        });
      });
    });
  });
});
