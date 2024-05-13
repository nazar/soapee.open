describe('Notifications', () => {
  context('Friend Requests', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Friend Requests', () => {
        it('Should notify user when a user requests to become friends', () => {
          cy
            .loginUser5()
            .visit('/profiles/1')
            .waitForQuery('userFriendStatus')

            .get('[data-cy=friend-request]').click()
            .waitForQuery('makeFriendLink')

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

                .get('[data-cy=notification-approve-friend-request]').click()
                .waitForQuery('approveFriendFromNotification')

                .get('[data-cy=notification-approve-friend-request]').should('not.exist')
                .get('[data-cy=notification-approved-friend-request]').should('exist');
            })

            .loginUser5()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Nazar Aziz")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/1')
                .get('[data-cy-target=friendRequestApproved]').should('exist');
            });
        });
      });

      context('Friend Request Approvals', () => {
        it('Should notify friend requester that request was approved from settings page', () => {
          cy
            .loginUser5()
            .visit('/profiles/1')
            .waitForQuery('userFriendStatus')

            .get('[data-cy=friend-request]').click()
            .waitForQuery('makeFriendLink')

            .loginUser1()
            .reload()
            .pushHistory('/settings/friends-pending')
            .waitForQuery('myIncomingPendingFriends')

            .get('[data-cy=user-card]:contains("Forgot")')
            .within(() => {
              cy
                .get('[data-cy=approve-request]').click()
                .waitForQuery('makeFriendLink');
            })

            .loginUser5()

            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Nazar Aziz")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/1')
                .get('[data-cy-target=friendRequestApproved]').should('exist');
            })

            .loginUser1()
            .reload()
            .get('[data-cy=notification-trigger]').click()
            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Forgot email")').should('exist')
                .get('[data-cy=notification-user]').invoke('attr', 'href').should('contains', '/profiles/5')
                .get('[data-cy=notification-approve-friend-request]').should('not.exist')
                .get('[data-cy=notification-approved-friend-request]').should('exist');
            });
        });
      });
    });
  });
});
