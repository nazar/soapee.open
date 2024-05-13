describe('Recipes', () => {
  context('Commenting on Recipes', () => {

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Logged in Users', () => {
        beforeEach(() => cy.loginUser1().visit('/recipes/2'));

        it('Should be able able to add, edit and delete comments to and on my Recipe', () => {
          const comment = 'this is a new comment';
          const updatedComment = 'this is an updated comment';

          cy
            .waitForQuery('recipe')

            .get('[data-cy=recipe-updated-at]:contains("years")').should('exist')
            .get('[data-cy=stats-label-comments]:contains("2")').should('exist')

            .setTinyMceContent('add-commentable-comment', comment)
            .get('button:contains("Comment")').should('not.be.disabled').click()
            .waitForQuery('createComment')

            .get('button:contains("Comment")').should('be.disabled')
            .getTinyMceContent('add-commentable-comment').should('be.empty')
            .get('[data-cy=stats-label-comments]:contains("3")').should('exist')

            .get(`.comment-detail:contains("${comment}")`).should('exist')
            .parents('[data-cy=comment]')
            .within(() => {
              cy
                .get('.voteable .score:contains("1")').should('exist')
                .get('.voteable .up-vote .up.orange').should('exist')

                .get('button[data-cy=edit-comment]').click()
                .get('.rich-text-display textarea')
                .then($textarea => $textarea.attr('id'))
                .then(id => cy.setTinyMceContent(id, updatedComment))
                .get('button:contains("Update")').click();
            })

            .waitForQuery('updateComment')
            .get(`.comment-detail:contains("${comment}")`).should('not.exist')
            .get(`.comment-detail:contains("${updatedComment}")`).should('exist')

            .reload()
            .get('[data-cy=recipe-updated-at]:contains("years")').should('exist')
            .get(`.comment-detail:contains("${comment}")`).should('not.exist')
            .get(`.comment-detail:contains("${updatedComment}")`).should('exist')

            .within(() => {
              cy
                .get('button[data-cy=moderator-comment-button]').click();
            })

            .get('button[data-cy=admin-controls-delete-comment]').click()

            .waitForQuery('deleteComment')
            .get(`.comment-detail:contains("${updatedComment}")`).should('not.exist')
            .get('[data-cy=stats-label-comments]:contains("2")').should('exist');
        });

        it('Should be able to delete other user comments on my recipe', () => {
          const comment = '1 T PPO Kaolin Clay';

          cy
            .waitForQuery('recipe')

            .get(`.comment-detail:contains("${comment}")`).should('exist')
            .within(() => {
              cy
                .get('button[data-cy=moderator-comment-button]').click();
            })
            .get('button[data-cy=admin-controls-delete-comment]').click()

            .waitForQuery('deleteComment')
            .get(`.comment-detail:contains("${comment}")`).should('not.exist');

        });

        it('Should be able to add reactions to recipe comments', () => {
          cy
            .waitForQuery('commentableComments')

            .get('.comment-detail:contains("1 T PPO Kaolin Clay")').should('exist')
            .parents('[data-cy=comment]')
            .within(() => {
              cy
                .get('button[data-cy=add-reaction]').click();
            })

            .get('[data-cy=reaction-emoji-picker]')
            .within(() => {
              cy
                .get('li button[aria-label="😀, grinning"]:first').click();
            })
            .waitForQuery('toggleReaction')

            .get('.comment-detail:contains("1 T PPO Kaolin Clay")')
            .parents('[data-cy=comment]')
            .within(() => {
              cy
                .get('.comment-detail [aria-label="😀, grinning"]').should('exist').click()
                .waitForQuery('toggleReaction')
                .get('.comment-detail [aria-label="😀, grinning"]').should('not.exist');
            });
        });

        it('Should allow favouriting a recipe comment', () => {
          cy
            .waitForQuery('commentableComments');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Favourite")').click();
            })
            .waitForQuery('toggleFavourite');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Favourited")').should('have.class', 'active').click();
            })
            .waitForQuery('toggleFavourite');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Favourite")').should('not.have.class', 'active');
            });
        });

        it('Should allow reporting recipe comments', () => {
          cy
            .waitForQuery('commentableComments');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Report")').click();
            })

            .get('[data-cy=report-content-modal]')
            .within(() => {
              cy
                .get('label:contains("Abusive")').click()
                .get('label:contains("Spam")').click()
                .get('textarea').type('Other info')
                .get('button:contains("Submit Report")').click();
            })
            .waitForQuery('reportReportable');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Report")').should('have.class', 'active').click();
            })

            .get('[data-cy=report-content-modal]')
            .within(() => {
              cy
                .get('label:contains("Abusive")').siblings('input').should('be.checked')
                .get('label:contains("Spam")').siblings('input').should('be.checked')
                .get('textarea').should('contain', 'Other info')

                .get('button:contains("Delete Report")').click();
            })
            .waitForQuery('reportReportable');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('button:contains("Report")').should('not.have.class', 'active');
            });
        });

        it('Should upvote comments', () => {
          cy
            .waitForQuery('commentableComments');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('[data-cy=voteable-column-not-mobile]')
                .within(() => {
                  cy
                    .get('.voteable .score:contains("0")').should('exist')
                    .get('.up-vote .caret.up').should('not.have.class', 'orange').click()
                    .waitForQuery('voteOnVoteable')
                    .get('.voteable .score:contains("0")').should('not.exist')
                    .get('.voteable .score:contains("1")').should('exist')
                    .get('.up-vote .caret.up').should('have.class', 'orange');
                });
            });

          cy.reload();

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('[data-cy=voteable-column-not-mobile]')
                .within(() => {
                  cy
                    .get('.voteable .score:contains("1")').should('exist')
                    .get('.up-vote .caret.up').should('have.class', 'orange')
                    .get('.up-vote .caret.up').click()
                    .waitForQuery('voteOnVoteable')
                    .get('.voteable .score:contains("1")').should('not.exist')
                    .get('.voteable .score:contains("0")').should('exist')
                    .get('.up-vote .caret.up').should('not.have.class', 'orange');
                });
            });
        });

        it('Should upvote comments on mobile view', () => {
          cy
            .viewport('iphone-x')
            .waitForQuery('commentableComments');

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('[data-cy=comment-info-mobile]')
                .within(() => {
                  cy
                    .get('.voteable .score:contains("0")').should('exist')
                    .get('.up-vote .caret.up').should('not.have.class', 'orange').click()

                    .waitForQuery('voteOnVoteable')
                    .get('.voteable .score:contains("0")').should('not.exist')
                    .get('.voteable .score:contains("1")').should('exist')
                    .get('.up-vote .caret.up').should('have.class', 'orange');
                });
            });

          cy.reload();

          getCommentSection('1 T PPO Kaolin Clay')
            .within(() => {
              cy
                .get('[data-cy=comment-info-mobile]')
                .within(() => {
                  cy
                    .get('.voteable .score:contains("1")').should('exist')
                    .get('.up-vote .caret.up').should('have.class', 'orange')
                    .get('.up-vote .caret.up').click()

                    .waitForQuery('voteOnVoteable')
                    .get('.voteable .score:contains("1")').should('not.exist')
                    .get('.voteable .score:contains("0")').should('exist')
                    .get('.up-vote .caret.up').should('not.have.class', 'orange');
                });
            });
        });
      });
    });

    context('Queries', () => {
      before(() => cy.resetDb());

      context('Anonymous users', () => {

        context('Recipe 2', () => {
          beforeEach(() => cy.visit('/recipes/2'));

          it('Should not show non-user controls', () => {
            cy
              .waitForQuery('commentableComments')

              .get('.comment-detail:contains("1 T PPO Kaolin Clay")')
              .parents('[data-cy=comment]')
              .within(() => {
                cy
                  .get('button:contains("Report")').should('not.exist');
              });
          });
        });

        context('Recipe 14', () => {
          beforeEach(() => cy.visit('/recipes/2'));

          it('Should not show reactions row when reactions at empty', () => {
            cy
              .waitForQuery('commentableComments')

              .get('[data-cy-comment-id=15] [data-cy=reactions]').should('not.exist');
          });
        });
      });
    });
  });
});

// helpers

function getCommentSection(comment) {
  return cy
    .get(`.comment-detail:contains("${comment}")`)
    .parents('[data-cy=comment]');
}
