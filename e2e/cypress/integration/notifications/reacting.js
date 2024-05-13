describe('Notifications', () => {
  context('Reacting', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Recipes', () => {
        beforeEach(() => cy.loginUser1());

        it('Should not show notification on my reactions', () => {
          cy
            .visit('/settings/recipes')
            .waitForQuery('myRecipes')

            .get('[data-cy=recipe-summary]:contains("Glycerine Hand and Body Liquid Soap")')
            .within(() => {
              cy
                .get('[data-cy=add-reaction]').click();
            })

            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-summary]:contains("Glycerine Hand and Body Liquid Soap")')
            .within(() => {
              cy
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 1)
                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine');
            })

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('not.exist');
        });

        it('Should notify recipe owner when their recipe is reacted', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy=recipe-summary]:contains("Master With Lard")')
            .within(() => {
              cy
                .get('[data-cy=add-reaction]').click();
            })

            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-summary]:contains("Master With Lard")')
            .within(() => {
              cy
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 1)
                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine');
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
                .get('[data-cy=summary] span[title="+1"]').should('exist')
                .get('[data-cy-target=recipes]').invoke('attr', 'href').should('contains', '/recipes/18');
            });
        });
      });

      context('Posts', () => {
        it('Should notify post owner when post is reacted', () => {
          cy
            .loginUser3()
            .visit('/posts/5')
            .waitForQuery('commentableComments')

            .get('[data-cy=add-reaction]').click()
            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('getPost')

            .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 1)
            .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine')

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
                .get('[data-cy=summary] span[title="+1"]').should('exist')
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
        it('Should notify comment owner when post comment is reacted', () => {
          cy
            .loginUser3()
            .visit('/posts/1')
            .waitForQuery('commentableComments')

            .get('[data-cy=comment] [data-cy=add-reaction]').click()
            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('comment')

            .get('[data-cy=comment]')
            .within(() => {
              cy
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 1)
                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine');
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
                .get('[data-cy=summary] span[title="+1"]').should('exist')
                .get('[data-cy-parent=comment]').should('exist').and('contain', 'Post')
                .get('[data-cy-parent=comment]').invoke('attr', 'href').should('contains', '/posts/1');
            });
        });
      });

      context('Recipe comments', () => {
        it('Should notify comment owner when recipe comment is reacted', () => {
          cy
            .loginUser3()
            .visit('/recipes/10')
            .waitForQuery('recipe')

            .get('[data-cy-comment-id=11] [data-cy=add-reaction]').click()
            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('comment')

            .get('[data-cy-comment-id=11]')
            .within(() => {
              cy
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 1)
                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine');
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
                .get('[data-cy=summary] span[title="+1"]').should('exist')
                .get('[data-cy-parent=comment]').should('exist').and('contain', 'Recipe')
                .get('[data-cy-parent=comment]').invoke('attr', 'href').should('contains', '/recipes/10');
            });
        });
      });
    });
  });
});
