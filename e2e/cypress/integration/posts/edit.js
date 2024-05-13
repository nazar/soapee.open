describe('Posts', () => {
  context('Edit', () => {

    context('Queries', () => {
      before(() => cy.resetDb());

      it('Should not allow editing another users post', () => {
        cy
          .loginUser2()
          .visit('/posts/1/edit')
          .waitForQuery('getPostForEdit')
          .get('[data-cy=post-cannot-edit-message]').should('exist');
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      context('Editing posts', () => {
        it('Should edit a forum post', () => {
          cy
            .loginUser2()
            .visit('/posts/3/edit')
            .waitForQuery('getPostForEdit')

            .get('[data-cy=select-forum-tags]').should('not.exist')
            .get('[data-cy=post-title] input').should('contain.value', 'user2 post')
            .get('[data-cy=post-title] input').type('{selectall}updated title')
            .setTinyMceContent('post-3', 'updated forum post comment')

            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost')

            .get('[data-cy=post-title]:contains("updated title")').should('exist')
            .reload()
            .waitForQuery('getPost')
            .get('[data-cy=post-title]:contains("updated title")').should('exist');
        });

        it('Should edit a forum post with forum tags', () => {
          cy
            .loginUser1()
            .visit('/posts/2/edit')
            .waitForQuery('getPostForEdit')

            .get('[data-cy=select-forum-tags]').should('exist')
            .get('[data-cy=select-forum-tags]').click()
            .get('[data-cy=select-forum-tags] [role=option]:contains("tag1")').click()
            .get('[data-cy=select-forum-tags] [role=option]:contains("tag2")').click()

            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost')

            .get('[data-cy=post-forum-tag]').its('length').should('equal', 2)
            .visit('/posts/2/edit')
            .waitForQuery('getPostForEdit')

            .get('[data-cy=select-forum-tags] a:contains("tag1")').should('exist')
            .get('[data-cy=select-forum-tags] a:contains("tag2")').should('exist')

            .get('[data-cy=select-forum-tags] a:contains("tag2") .delete').click()
            .get('[data-cy=select-forum-tags] a:contains("tag2")').should('not.exist')
            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost')
            .get('[data-cy=post-forum-tag]').its('length').should('equal', 1)

            .visit('/posts/2/edit')
            .waitForQuery('getPostForEdit')
            .get('[data-cy=select-forum-tags] a:contains("tag1") .delete').click()
            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost')
            .get('[data-cy=post-forum-tag]').should('not.exist');
        });

        it('Should allow an admin to edit a post', () => {
          cy
            .loginUser1()
            .visit('/posts/3/edit')
            .waitForQuery('getPostForEdit')

            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost');
        });

        it('Should allow a forum owner to edit posts', () => {
          cy
            .loginUser2()
            .visit('/posts/6/edit')
            .waitForQuery('getPostForEdit')

            .get('button:contains("Save Post")').click()
            .waitForQuery('updateForumPost')
            .waitForQuery('getPost');
        });
      });
    });
  });
});
