import request from 'supertest';
import { expect } from 'chai';

import app from 'app';

import knex from 'test/utils/knex';
import responseHandler from 'test/utils/graphql';
import getToken from 'test/utils/getToken';
import loadFixtures from 'test/utils/loadFixtures';
import truncateTables from 'test/utils/truncateTables';

describe('Mutation', () => {
  let token;

  beforeEach(() => {
    return truncateTables()
      .then(() => loadFixtures());
  });

  describe('Comment', () => {
    let recipe;

    beforeEach(() =>
      getToken({
        username: 'nazar',
        password: 'password'
      }).then(t => (token = t))
    );

    beforeEach(() => knex('recipes')
      .limit(1)
      .then(res => ([recipe] = res))
    );

    describe('createComment', () => {

      it('should create a comment', () => {
        return createCommentHelper(token, recipe)
          .then(res => responseHandler(res, () => {
            const { body: { data: { createComment } } } = res;

            expect(createComment.commentableId).to.equal(String(recipe.id));
            expect(createComment.commentableType).to.equal('recipes');
            expect(createComment.userId).to.exist;
            expect(createComment.comment).to.exist;
          }));
      });

      it('Should set the commentables comments stats', () => {
        return createCommentHelper(token, recipe)
          .then(res => responseHandler(res, () => {
            const { body: { data: { createComment } } } = res;

            expect(createComment).to.be.ok;

            return knex('recipes')
              .where({ id: recipe.id })
              .limit(1)
              .then((res2) => {
                [recipe] = res2;

                expect(recipe.stats).to.be.ok;
                expect(recipe.stats.comments.comments).to.equal(3);
              });
          }));
      });

    });

    describe('updateComment', () => {
      let comment;

      beforeEach(() =>
        createCommentHelper(token, recipe)
          .then(({ body: { data } }) => data.createComment)
          .then(c => (comment = c))
      );

      it('should update a comment', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                updateComment(
                  id: ${comment.id}
                  input: {
                    comment: "this comment updated"
                  }
                ) {
                  id
                  comment
                  commentableId
                  commentableType
                  userId
                  lastEdited
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { updateComment } } } = res;

            expect(updateComment.commentableId).to.equal(String(recipe.id));
            expect(updateComment.commentableType).to.equal('recipes');
            expect(updateComment.userId).to.be.ok;
            expect(updateComment.lastEdited).to.be.ok;
            expect(updateComment.comment).to.equal('this comment updated');
          }));
      });
    });
  });

  describe('Comment Permissions', () => {

    describe('Locked Posts', () => {
      let post;

      beforeEach(() =>
        getToken({
          username: 'nazar',
          password: 'password'
        }).then(t => (token = t))
      );

      beforeEach(() => knex('posts')
        .where({ title: 'locked post' })
        .limit(1)
        .then(res => ([post] = res))
      );


      it('Should not allow posting comments on a locked post', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                createComment(
                  input: {
                    commentableId: ${post.id},
                    commentableType: posts,
                    comment: "this comment"
                  }
                ) {
                  id
                  commentableId
                  commentableType
                  userId
                  comment
                }
              }
            `
          })
          .then((res) => {
            expect(res.body.errors.length).to.be.ok;
            expect(res.body.errors[0].message).to.be.equal('Post is locked');
          });
      });
    });

    describe('Non Public Recipes', () => {
      beforeEach(() =>
        getToken({
          username: 'nazar',
          password: 'password'
        }).then(t => (token = t))
      );

      it('Should not allow posting comments on others private recipes', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                createComment(
                  input: {
                    commentableId: 6,
                    commentableType: recipes,
                    comment: "this comment"
                  }
                ) {
                  id
                  commentableId
                  commentableType
                  userId
                  comment
                }
              }
            `
          })
          .then((res) => {
            expect(res.body.data).to.be.null;
            expect(res.body.errors).to.not.be.empty;
            expect(res.body.errors[0].message).to.be.equal('Only the recipe owner can add comments');
          });
      });

      it('Should not allow posting comments on others friend recipes when Im not a friend', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                createComment(
                  input: {
                    commentableId: 5,
                    commentableType: recipes,
                    comment: "this comment"
                  }
                ) {
                  id
                  commentableId
                  commentableType
                  userId
                  comment
                }
              }
            `
          })
          .then((res) => {
            expect(res.body.data).to.be.null;
            expect(res.body.errors).to.not.be.empty;
            // eslint-disable-next-line max-len
            expect(res.body.errors[0].message).to.be.equal('Recipe is private and can only be viewed by its owner or the owner friends');
          });
      });

      it('Should post comments on my recipe with friends visibility', async () => {
        const token2 = await getToken({
          username: 'stranger',
          password: 'password'
        });

        return request(app)
          .post('/api/graphql')
          .set(token2)
          .send({
            query: `
              mutation {
                createComment(
                  input: {
                    commentableId: 5,
                    commentableType: recipes,
                    comment: "this comment"
                  }
                ) {
                  id
                  commentableId
                  commentableType
                  userId
                  comment
                }
              }
            `
          })
          .then((res) => {
            expect(res.body.data).to.be.ok;
            expect(res.body.errors).to.be.undefined;
          });
      });
    });
  });

  describe('deleteComment', () => {
    let comment;

    describe('Permissions', () => {

      beforeEach(() =>
        getToken({
          username: 'nazar',
          password: 'password'
        }).then(t => (token = t))
      );

      describe('Comment on my recipe', () => {
        beforeEach(() => {
          return knex('comments')
            .where('comment', 'like', 'Hi Tolly!%')
            .limit(1)
            .then(res => ([comment] = res));
        });

        it('Should let me delete another users comment', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              mutation {
                deleteComment(id: ${comment.id}) {
                  id
                }
              }
            `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { deleteComment } } } = res;

              expect(Number(deleteComment.id)).to.equal(Number(comment.id));
              return testCommentIsDeleted(comment);
            }));
        });
      });

      describe('Comment on another users recipe', () => {
        beforeEach(() => {
          return knex('comments')
            .where({ comment: 'Spam Comment' })
            .limit(1)
            .then(res => ([comment] = res));
        });

        it('Should NOT let me delete the comment', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              mutation {
                deleteComment(id: ${comment.id}) {
                  id
                }
              }
            `
            })
            .then((res) => {
              expect(res.body.errors).to.be.ok;
            });
        });
      });

      describe('Comment on my post', () => {
        beforeEach(() => {
          return knex('comments')
            .where('comment', 'like', 'first comment on a post!!%')
            .limit(1)
            .then(res => ([comment] = res));
        });

        it('Should let me delete the comment', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              mutation {
                deleteComment(id: ${comment.id}) {
                  id
                }
              }
            `
            })
            .then(res => responseHandler(res, () => {
              const { body: { data: { deleteComment } } } = res;

              expect(Number(deleteComment.id)).to.equal(Number(comment.id));

              return testCommentIsDeleted(comment);
            }));
        });
      });

      describe('Comment on another users post', () => {
        beforeEach(() => {
          return knex('comments')
            .where('comment', '=', 'comment on post3')
            .limit(1)
            .then(res => ([comment] = res));
        });

        it('Should NOT let me delete the comment', () => {
          return request(app)
            .post('/api/graphql')
            .set(token)
            .send({
              query: `
              mutation {
                deleteComment(id: ${comment.id}) {
                  id
                }
              }
            `
            })
            .then(res => expect(res.body.errors).to.be.ok);
        });
      });

    });

    describe('My own comments', () => {
      beforeEach(() => {
        return knex('comments')
          .where({ comment: 'lemon rose' })
          .limit(1)
          .then(res => ([comment] = res));
      });

      beforeEach(() =>
        getToken({
          username: 'nazar',
          password: 'password'
        }).then(t => (token = t))
      );

      it('Should let me delete my own comment', () => {
        return request(app)
          .post('/api/graphql')
          .set(token)
          .send({
            query: `
              mutation {
                deleteComment(id: ${comment.id}) {
                  id
                }
              }
            `
          })
          .then(res => responseHandler(res, () => {
            const { body: { data: { deleteComment } } } = res;

            expect(Number(deleteComment.id)).to.equal(Number(comment.id));

            return testCommentIsDeleted(comment);
          }));
      });
    });
  });
});

// helpers

function testCommentIsDeleted(comment) {
  return knex('comments')
    .where({ id: comment.id })
    .limit(1)
    .then(([res]) => {
      expect(res.deleted_at).to.be.ok;
      expect(res.deleted_by_user_id).to.be.ok;
    });
}

function createCommentHelper(token, recipe) {
  return request(app)
    .post('/api/graphql')
    .set(token)
    .send({
      query: `
        mutation {
          createComment(
            input: {
              commentableId: ${recipe.id},
              commentableType: recipes,
              comment: "this comment"
            }
          ) {
            id
            commentableId
            commentableType
            userId
            comment
          }
        }
      `
    });
}
