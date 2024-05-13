describe('Notifications', () => {
  context('Voting', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Recipes', () => {
        beforeEach(() => cy.loginUser1());

        it('Should not show notification on my upvotes', () => {
          cy
            .visit('/settings/recipes')
            .waitForQuery('myRecipes')

            .get('[data-cy=recipe-summary]:contains("Glycerine Hand and Body Liquid Soap")')
            .within(() => {
              cy
                .get('[data-cy=up-vote]').click()
                .waitForQuery('voteOnVoteable');
            })

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('not.exist');
        });

        it('Should notify recipe owner when their recipe is upvotes', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy=recipe-summary]:contains("Master With Lard")')
            .within(() => {
              cy
                .get('[data-cy=up-vote]').click()
                .waitForQuery('voteOnVoteable');
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
                .get('[data-cy-target=recipes]').should('exist').and('contain', 'Recipe')
                .get('[data-cy-target=recipes]').invoke('attr', 'href').should('contains', '/recipes/18');
            });
        });
      });

      context('Posts', () => {
        it('Should notify post owner when post is upvoted', () => {
          cy
            .loginUser3()
            .visit('/posts/5')
            .waitForQuery('commentableComments')

            .get('[data-cy=up-vote]').click()
            .waitForQuery('voteOnVoteable')

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
                .get('[data-cy=notification-user]:contains("Stranger Danger")').click()
                .waitForQuery('user');
            })

            .get('[data-cy=user-notifications]').should('not.exist')
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]').should('exist');
        });
      });

      context('Post comments', () => {
        it('Should notify comment owner when post comment is upvoted', () => {
          cy
            .loginUser3()
            .visit('/posts/1')
            .waitForQuery('commentableComments')

            .get('[data-cy-comment-id=8] [data-cy=up-vote]').click()
            .waitForQuery('voteOnVoteable')

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
      });

      context('Recipe comments', () => {
        it('Should notify comment owner when recipe comment is upvoted', () => {
          cy
            .loginUser3()
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy-comment-id=11] [data-cy=up-vote]').click()
            .waitForQuery('voteOnVoteable')

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
