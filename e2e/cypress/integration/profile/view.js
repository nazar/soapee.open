describe('Profiles', () => {
  context('View', () => {

    context('Queries', () => {
      before(() => cy.resetDb());

      context('Anon users', () => {
        context('Friends', () => {
          it('Should not show friendship option button', () => {
            cy
              .visit('/profiles/1')
              .waitForQuery('user')
              .get('[data-cy=profile-actions]').should('not.exist');
          });
        });

        context('Comment and Recipe visibility', () => {

          it('Should not show comments on private recipes', () => {
            cy
              .visit('/profiles/3/comments')
              .waitForQuery('comments')
              .get('[data-cy=comment]').its('length').should('equal', 1)
              .get('[data-cy=comment]:contains("Spam")').should('not.exist');
          });
        });
      });

      context('User 1', () => {
        beforeEach(() => cy.loginUser1());

        context('Friends', () => {
          it('Should not show friend request button when viewing my own profile', () => {
            cy
              .visit('/profiles/1')
              .waitForQuery('user')
              .get('[data-cy=profile-actions]').should('not.exist');
          });

          it('Should unfriend button for friends', () => {
            cy
              .visit('/profiles/2')
              .waitForQuery('user')
              .get('[data-cy=profile-actions] [data-cy=unfriend]').should('exist');
          });

          it('Should cancel button for pending friend requests', () => {
            cy
              .visit('/profiles/3')
              .waitForQuery('user')
              .get('[data-cy=profile-actions] [data-cy=cancel-request]').should('exist');
          });
        });

        context('Comments', () => {
          it('Should sort comments', () => {
            cy
              .visit('/profiles/1/comments')
              .waitForQuery('comments')
              .then(({ request }) => {
                expect(request.body.variables.order.field).to.equal('createdAt');
                expect(request.body.variables.order.direction).to.equal('asc');
              })
              .get('[data-cy=comment]:first').invoke('attr', 'data-cy-comment-id').should('equal', '5')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=dropdown] span:contains("Newest")').click()
              .waitForQuery('comments')
              .then(({ request }) => {
                expect(request.body.variables.order.field).to.equal('createdAt');
                expect(request.body.variables.order.direction).to.equal('desc');
              })
              .get('[data-cy=comment]:first').invoke('attr', 'data-cy-comment-id').should('equal', '10')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=dropdown] span:contains("Highest rated")').click()
              .waitForQuery('comments')
              .then(({ request }) => {
                expect(request.body.variables.order.field).to.equal('score');
                expect(request.body.variables.order.direction).to.equal('desc');
              })
              .get('[data-cy=comment]:first').invoke('attr', 'data-cy-comment-id').should('equal', '10')
              .get('[data-cy=comment]:last').invoke('attr', 'data-cy-comment-id').should('equal', '5');
          });
        });
      });

      context('Comment and post contexts', () => {
        it('Should show post context', () => {
          cy
            .visit('/profiles/2/posts')
            .waitForQuery('posts')
            .get('[data-cy=post-context-button]').its('length').should('equal', 1);
        });

        it('Should show comment context', () => {
          cy
            .visit('/profiles/2/comments')
            .waitForQuery('comments')
            .get('[data-cy=comment-context-button]').its('length').should('equal', 10);
        });
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb().loginUser1());

      context('Friends', () => {
        beforeEach(() => cy.visit('/profiles/5'));

        it('Should cancel a friend request', () => {
          cy
            .waitForQuery('user')
            .get('[data-cy=profile-actions] [data-cy=friend-request]').click()
            .waitForQuery('makeFriendLink')
            .waitForQuery('userFriendStatus')

            .get('[data-cy=profile-actions] [data-cy=cancel-request]').click()
            .waitForQuery('removeFriendLink')
            .get('[data-cy=profile-actions] [data-cy=friend-request]').should('exist');
        });

        it('Should make a friend request', () => {
          cy
            .waitForQuery('user')
            .get('[data-cy=profile-actions] [data-cy=friend-request]').click()
            .waitForQuery('makeFriendLink')
            .waitForQuery('userFriendStatus')

            .get('[data-cy=profile-actions] [data-cy=friend-request]').should('not.exist')
            .get('[data-cy=profile-actions] [data-cy=cancel-request]').should('exist')

            .loginUser5()
            .visit('/settings/friends-pending')
            .waitForQuery('myIncomingPendingFriendsSummary')

            .get('button:contains("Approve")').click()
            .waitForQuery('makeFriendLink')

            .loginUser1()
            .visit('/profiles/5')
            .waitForQuery('user')
            .get('[data-cy=profile-actions] [data-cy=unfriend]').click()
            .waitForQuery('removeFriendLink')
            .get('[data-cy=profile-actions] [data-cy=friend-request]').should('exist');
        });
      });
    });
  });
});
