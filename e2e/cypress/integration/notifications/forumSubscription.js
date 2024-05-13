describe('Notifications', () => {
  context('Forum Subscriptions', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Subscribes to a forum', () => {
        it('Should notify user when a user subscribes to their forum', () => {
          cy
            .loginUser5()
            .visit('/forums/1')
            .waitForQuery('postablePosts')

            .get('[data-cy=subscribe-button]').click()
            .waitForQuery('forumUserSubscriptionToggleCurrentUser')

            .loginUser1()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Forgot email")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/5')
                .get('[data-cy=notification-subscribed-forum] a').invoke('attr', 'href').should('contains', '/forums/1')
                .get('[data-cy=notification-subscribed-forum]:contains("testforum")').should('exist');
            });
        });
      });
    });
  });
});
