describe('Posts', () => {
  context('View', () => {
    context('Queries', () => {
      before(() => cy.resetDb());

      context('Not logged in', () => {
        beforeEach(() => cy.visit('/posts/1'));

        context('Post details', () => {
          it('Should not show post moderator buttons', () => {
            cy
              .waitForQuery('getPost')
              .waitForQuery('commentableComments')

              .get('[data-cy=moderator-post-button]')
              .should('not.exist')

              .get('[data-cy=moderator-comment-button]')
              .should('not.exist');
          });

          it('Should show reactions but not update them', () => {
            cy
              .visit('/posts/1')
              .waitForQuery('getPost')

              .get('[data-cy=post-detail]')
              .within(() => {
                cy
                  .get('[data-cy=reactions]').should('exist')
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 2)
                  .get('[data-cy=reactions] [data-cy=add-reaction]').should('not.exist');
              });
          });
        });
      });

      context('Viewing my own posts', () => {
        beforeEach(() => cy.loginUser1().visit('/posts/1'));

        it('Should show post moderator buttons', () => {
          cy
            .waitForQuery('getPost')
            .waitForQuery('commentableComments')

            .get('[data-cy=moderator-post-button]')
            .should('exist')

            .get('[data-cy=post-content]:contains("this is the post content")').should('exist')

            .get('[data-cy=moderator-comment-button]')
            .should('exist');
        });
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Desktop', () => {
        context('User1', () => {
          beforeEach(() => cy.loginUser1().visit('/posts/1'));

          it('Should vote on a post', () => {
            cy
              .waitForQuery('getPost')
              .waitForQuery('commentableComments')

              .get('[data-cy=post-detail]:contains("this is the post content") .voteable')
              .within(() => {
                cy
                  .get('.score:contains("0")').should('exist')
                  .get('.up-vote i.orange').should('not.exist')
                  .get('.up-vote').click()
                  .waitForQuery('voteOnVoteable')

                  .get('.score:contains("1")').should('exist')
                  .get('.up-vote i.orange').should('exist');
              });
          });

          it('Should lock the post', () => {
            cy
              .waitForQuery('commentableComments')

              .get('[data-cy=create-message]').should('exist')
              .get('[data-cy=moderator-post-button]').should('exist').click()
              .get('.popup button:contains("Lock")').click()
              .waitForQuery('lockPost')

              .get('[data-cy=create-message]').should('not.exist')
              .get('.popup button:contains("Lock")').should('not.exist')
              .get('.popup button:contains("Unlock")').click()
              .waitForQuery('unlockPost')

              .get('[data-cy=create-message]').should('exist')
              .get('.popup button:contains("Lock")').should('exist');
          });

          it('Should add a comment to the post and update post forum stats', () => {
            cy
              .waitForQuery('commentableComments')

              .setTinyMceContent('add-commentable-comment', 'new forum post comment')
              .get('button:contains("Comment")').click()
              .waitForQuery('createComment')
              .pushHistory('/forums')

              .get('[data-cy=forum-summary-row]:contains("testforum")')
              .within(() => {
                cy
                  .get('[data-cy=stats-label-posts]:contains("3")').should('exist')
                  .get('[data-cy=stats-label-comments]:contains("2")').should('exist');
              });
          });

          it('Should delete the post', () => {
            cy
              .waitForQuery('commentableComments')

              .get('[data-cy=moderator-post-button]').click()
              .get('.popup button:contains("Delete")').click()
              .waitForQuery('deletePost')
              .waitForQuery('getPost')
              .get('[data-cy=post-not-found-message]')

              .pushHistory('/forums')
              .get('[data-cy=forum-summary-row]:contains("testforum")')
              .within(() => {
                cy
                  .get('[data-cy=stats-label-posts]:contains("2")').should('exist')
                  .get('[data-cy=stats-label-comments]').should('not.exist');
              });
          });
        });

        context('User2', () => {
          beforeEach(() => cy.loginUser2());

          it('Should show reactions and update them', () => {
            cy
              .visit('/posts/1')
              .waitForQuery('getPost')

              .get('[data-cy=post-detail]')
              .within(() => {
                cy
                  .get('[data-cy=reactions]').should('exist')
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 2)
                  .get('[data-cy=reactions] [data-cy=add-reaction]').should('exist').click();
              })

              .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
              .waitForQuery('toggleReaction')
              .waitForQuery('getPost')

              .get('[data-cy=reaction-emoji-picker]').should('not.exist')
              .get('[data-cy=post-detail]')
              .within(() => {
                cy
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 3)
                  .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine')
                  .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("1")').should('exist').click()
                  .waitForQuery('toggleReaction')
                  .waitForQuery('getPost')

                  .get('[data-cy=reaction-emoji] span[title="+1"]').should('not.exist');
              });
          });
        });
      });

      context('Mobile', () => {
        context('Logged in users', () => {
          beforeEach(() => cy.viewport('iphone-x').loginUser1().visit('/posts/1'));

          it('Should be able to vote on post', () => {
            cy
              .waitForQuery('getPost')

              .get('[data-cy=post-content]:contains("this is the post content")').should('exist')

              .get('[data-cy=post-detail]:contains("this is the post content") .voteable')
              .within(() => {
                cy
                  .get('.score:contains("0")').should('exist')
                  .get('.up-vote i.orange').should('not.exist')
                  .get('.up-vote').click()
                  .waitForQuery('voteOnVoteable')

                  .get('.score:contains("1")').should('exist')
                  .get('.up-vote i.orange').should('exist');
              });
          });

          it('Should view reactions', () => {
            cy
              .waitForQuery('getPost')
              .get('[data-cy=post-detail] ')
              .within(() => {
                cy
                  .get('[data-cy=reactions]').should('exist')
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 2);
              });
          });
        });
      });
    });
  });
});
