describe('Notifications', () => {
  context('Posting', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Forum subscribers and post notifications', () => {
        it('Should notify forum subscribers when a post is made to a forum', () => {
          cy
            .loginUser2()
            .visit('/forums/2')
            .waitForQuery('postablePosts')

            .get('[data-cy=form-post]')
            .within(() => {
              cy
                .get('input[name=title]').type('post title')
                .setTinyMceContent('new-content', 'this is my forum comment')
                .get('button:contains("Post")').click()
                .waitForQuery('createForumPost');
            })

            .loginUser1()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '2')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Aziz Nazar")').should('exist')
                .its('length').should('equal', 2)

                .get('[data-cy-target=subscribedForumPost]').should('exist')
                .get('[data-cy-target=myForumPost]').should('exist')

                .get('[data-cy=subbed-post-text] a:contains("post title")').should('exist')
                .its('length').should('equal', 2)

                .get('[data-cy=subbed-post-text] a:contains("post title")')
                .invoke('attr', 'href').should('contains', '/posts/7')

                .get('[data-cy=subbed-post-text] a:contains("another_forum")')
                .invoke('attr', 'href').should('contains', '/forums/2');
            });
        });
      });

      context('Post participants', () => {
        it('Should notify all post participants of a new comment', () => {
          cy
            .loginUser1()
            .visit('/posts/1')
            .waitForQuery('commentableComments')

            .setTinyMceContent('add-commentable-comment', 'this is my comment')
            .get('button:contains("Comment")').click()
            .waitForQuery('createComment')

            .loginUser2()
            .reload()
            .waitForQuery('userNotificationUnreadCount')

            .get('[data-cy=notification-count]').should('exist').and('contain', '1')
            .get('[data-cy=notification-trigger]').click()

            .get('[data-cy=user-notifications]')
            .within(() => {
              cy
                .get('[data-cy=notification-user]:contains("Nazar Aziz")').should('exist')
                .get('[data-cy-target=postParticipant]').should('exist')

                .get('[data-cy=participated-comment-text] a:contains("this is the post")').should('exist')
                .get('[data-cy=participated-comment-text] a:contains("this is the post")')
                .invoke('attr', 'href').should('contains', '/posts/1')

                .get('[data-cy=participated-comment-text] a:contains("Forum")')
                .invoke('attr', 'href').should('contains', '/forums/1');
            });

        });
      })
    });
  });
});
