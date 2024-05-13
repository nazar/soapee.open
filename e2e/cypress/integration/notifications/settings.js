describe('Notifications', () => {
  context('My Profile Settings', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Unread notifications section', () => {
        it('Should show my unread notifications', () => {
          cy
            .loginUser5()
            .visit('/profiles/1')
            .waitForQuery('userFriendStatus')

            .get('[data-cy=friend-request]').click()
            .waitForQuery('makeFriendLink')

            .loginUser1()
            .visit('/settings/notifications-unread')
            .waitForQuery('userNotifications')

            .get('[data-cy=settings-notification-count]:contains("1")').should('exist')
            .get('[data-cy=mark-notifications-read]').click()
            .waitForQuery('markAllMyNotificationsAsRead')
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=settings-notification-count]:contains("1")').should('not.exist')
            .get('[data-cy=notification-count]:contains("1)').should('not.exist')

            .pushHistory('/settings/notifications-all')
            .waitForQuery('userNotifications')

            .get('[data-cy=notification-item]').its('length').should('equal', 1);
        });
      });
    });
  });
});
