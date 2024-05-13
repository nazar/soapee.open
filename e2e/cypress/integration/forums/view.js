describe('Forums', () => {
  context('View', () => {
    context('Anonymous users', () => {
      context('Queries', () => {
        it('Should show reactions but not update them', () => {
          cy
            .visit('/forums/1')
            .waitForQuery('postablePosts')

            .get('[data-cy=postable]')
            .within(() => {
              cy
                .get('[data-cy=reactions]').should('exist')
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 2)
                .get('[data-cy=reactions] [data-cy=add-reaction]').should('not.exist');
            });
        });

        it('Should not show reaction row when no reactions present', () => {
          cy
            .visit('/forums/3')
            .waitForQuery('postablePosts')

            .get('[data-cy-post-id=6] [data-cy=reactions]').should('not.exist');
        });
      });
    });

    context('Logged in', () => {
      context('Queries', () => {
        before(() => cy.resetDb());

        context('General assertions', () => {
          it('Should show not context button on posts', () => {
            cy
              .loginUser1()
              .visit('/forums/1')
              .waitForQuery('postablePostsSummary')

              .get('[data-cy=post-context-button]').should('not.exist');
          });
        });

        context('Locked forums', () => {
          beforeEach(() => cy.loginUser1().visit('/forums/3'));

          it('Should recognise locked forums', () => {
            cy
              .waitForQuery('forum')
              .get('[data-cy=form-post]').should('not.exist')
              .get('.message:contains("Forum is locked")').should('exist');
          });
        });

        context('Meta Forums - all forum', () => {
          beforeEach(() => cy.loginUser1().visit('/forums/all'));

          it('Should show all posts for al forums and oils', () => {
            cy
              .waitForQuery('forum')
              .get('[data-cy=subscribe-button]').should('not.exist')
              .get('[data-cy=form-post]').should('not.exist')
              .get('[data-cy=stats-posts]').should('not.exist')

              .waitForQuery('postablePosts')
              .get('[data-cy=sort-order-bar]').should('exist')
              .get('[data-cy=post]').its('length').should('equal', 6);
          });

          it('Should show context button on posts', () => {
            cy
              .waitForQuery('forum')

              .get('[data-cy=post-context-button]').its('length').should('equal', 6);
          });
        });

        context('editing forum posts', () => {
          it('Should display an edit button on my posts', () => {
            cy
              .loginUser1()
              .visit('/forums/1')
              .waitForQuery('postablePostsSummary')

              .get('[data-cy-post-id=1] [data-cy=edit-post]').should('exist')
              .get('[data-cy-post-id=2] [data-cy=edit-post]').should('exist')
              .get('[data-cy-post-id=4] [data-cy=edit-post]').should('exist')

              .pushHistory('/forums/3')
              .waitForQuery('postablePostsSummary')
              // should exist as user1 is an admin
              .get('[data-cy-post-id=3] [data-cy=edit-post]').should('exist')

              .pushHistory('/posts/3/edit')
              .waitForQuery('forumTags')
              // should be able to edit post since user1 is an admin
              .get('input[name=title]').should('exist');
          });

          it('Should display an edit button for admins', () => {
            cy
              .loginUser1()
              .visit('/forums/3')
              .waitForQuery('postablePostsSummary')

              .get('[data-cy-post-id=3] [data-cy=edit-post]').should('exist');
          });

          it('Should display an edit button for forum owners', () => {
            cy
              .loginUser2()
              .visit('/forums/3')
              .waitForQuery('postablePostsSummary')

              .get('[data-cy-post-id=3] [data-cy=edit-post]').should('exist');
          });
        });
      });

      context('Mutations', () => {
        context('User1', () => {
          beforeEach(() => cy.resetDb().loginUser1());

          it('Should Create a forum Post', () => {
            cy
              .visit('/forums/1')
              .waitForQuery('forum')

              .get('[data-cy=stats-label-posts]:contains("0")').should('exist')
              .get('[data-cy=form-post]').should('exist')
              .get('[data-cy=form-post]')
              .within(() => {
                cy
                  .get('input[name=title]').type('Post 1 title')
                  .get('[data-cy=select-forum-tags]').click()
                  .get('[data-cy=select-forum-tags] [role=option]:contains("tag1")').click()
                  .get('[data-cy=select-forum-tags] [role=option]:contains("tag2")').click()
                  .setTinyMceContent('new-content', 'New post content')

                  .get('button:contains("Post")').should('not.be.disabled').click();
              })
              .waitForQuery('createForumPost')
              .waitForQuery('forum')

              .get('[data-cy=post]:contains("Post 1 title")').should('exist')
              .getTinyMceContent('new-content').should('be.empty')
              .get('[data-cy=select-forum-tags] a.ui.label').should('not.exist')
              .get('[data-cy=stats-label-posts]:contains("4")').should('exist')

              .get('[data-cy=post-forum-tag]').its('length').should('equal', 2)
              .get('[data-cy=post-forum-tag]:contains("tag1")').should('exist')
              .get('[data-cy=post-forum-tag]:contains("tag2")').should('exist');
          });

          it('Should edit my own Post', () => {
            cy
              .visit('/posts/1')
              .waitForQuery('getPost')

              .get('[data-cy=post-detail]')
              .within(() => {
                cy
                  .get('a:contains("Edit")').click()
                  .waitForQuery('getPostForEdit');
              })

              .setTinyMceContent('post-1', 'This is the updated post content')
              .get('button:contains("Save Post")').click()
              .waitForQuery('updateForumPost')

              .get('[data-cy=post-detail]:contains("This is the updated post content")').should('exist');
          });

          it('Should subscribe to a forum', () => {
            cy
              .visit('/forums/1')
              .waitForQuery('forum')
              .waitForQuery('postablePosts')

              .get('[data-cy=stats-label-subscribers]:contains("0")').should('exist')
              .get('button[data-cy=subscribe-button]').should('not.have.class', 'active').click()
              .waitForQuery('forumUserSubscriptionToggleCurrentUser')
              .waitForQuery('forum')
              .get('button[data-cy=subscribe-button]').should('have.class', 'active')
              .get('[data-cy=stats-label-subscribers]:contains("1")').should('exist')

              .reload()
              .waitForQuery('forum')
              .waitForQuery('postablePosts')

              .get('button[data-cy=subscribe-button]').should('have.class', 'active').click()
              .waitForQuery('forumUserSubscriptionToggleCurrentUser')
              .waitForQuery('forum')
              .get('button[data-cy=subscribe-button]').should('not.have.class', 'active')
              .get('[data-cy=stats-label-subscribers]:contains("0")').should('exist');
          });

          it('Should display recently commented posts by default', () => {
            cy
              .visit('/forums/1')
              .waitForQuery('postablePosts')

              .get('[data-cy=sort-order-bar] div.text:contains("Latest Activity")').should('exist')
              .get('[data-cy=post]:first:contains("this is the post")').should('exist')

              .pushHistory('/posts/4')
              .waitForQuery('commentableComments')
              .setTinyMceContent('add-commentable-comment', 'adding new comment to post')
              .get('button:contains("Comment")').click()
              .waitForQuery('createComment')

              .pushHistory('/forums/1')
              .waitForQuery('postablePosts')
              .get('[data-cy=post]:first:contains("not locked post")').should('exist');
          });
        });

        context('User2', () => {
          beforeEach(() => cy.resetDb().loginUser2());

          it('Should show reactions and update them', () => {
            cy
              .visit('/forums/1')
              .waitForQuery('postablePosts')

              .get('[data-cy-post-id=1]')
              .within(() => {
                cy
                  .get('[data-cy=reactions]').should('exist')
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 2)
                  .get('[data-cy=reactions] [data-cy=add-reaction]').should('exist').click();
              })

              .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
              .waitForQuery('toggleReaction')
              .waitForQuery('post')

              .get('[data-cy=reaction-emoji-picker]').should('not.exist')
              .get('[data-cy-post-id=1]')
              .within(() => {
                cy
                  .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 3)
                  .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine')
                  .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("1")').should('exist').click()
                  .waitForQuery('toggleReaction')
                  .waitForQuery('post')

                  .get('[data-cy=reaction-emoji] span[title="+1"]').should('not.exist');
              });
          });
        });
      });
    });
  });
});
