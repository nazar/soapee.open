import { selectOilAndSetWeight } from '../../utils/calculatorHelpers';

describe('Authentication', () => {

  context('Feed', () => {

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      it('Should show new user in feed', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarrr')
          .get('input[name=password]').type('passworddd')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup')
          .url().should('contain', '/settings')
          .pushHistory('/feed')
          .waitForQuery('getFeed')

          .get('[data-cy=feed-item-new-user]:contains("nazarrr")').should('exist')
          .get('[data-cy=feed-item-new-user]:contains("nazarrr") .time-ago:contains("a minute")').should('exist');
      });

      context('Signed in', () => {
        beforeEach(() => cy.loginUser1());

        context('Recipes', () => {
          beforeEach(() => cy.visit('/calculator').waitForQuery('oils'));

          it('Should show new public recipe in feed', () => {
            selectOilAndSetWeight('Cocoa Butter', '70.00');
            selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

            cy
              .get('[data-cy=recipe-name] input').type('My Recipe Name')
              .setTinyMceContent('recipe-description', 'Recipe description')
              .setTinyMceContent('recipe-notes', 'Recipe notes')
              .get('label:contains("Public -")').click()

              .get('button:contains("Save Recipe")').click()
              .waitForQuery('createRecipe')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-public-recipe] a:contains("Nazar Aziz")').should('exist')
              .get('[data-cy=feed-item-new-public-recipe] a:contains("Recipe Name")').should('exist');
          });

          it('Should not show new private recipe in feed', () => {
            selectOilAndSetWeight('Cocoa Butter', '70.00');
            selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

            cy
              .get('[data-cy=recipe-name] input').type('Private Recipe Name')
              .setTinyMceContent('recipe-description', 'Recipe description')
              .setTinyMceContent('recipe-notes', 'Recipe notes')

              .get('button:contains("Save Recipe")').click()
              .waitForQuery('createRecipe')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-public-recipe]:contains("Private Recipe Name")').should('not.exist');
          });
        });

        context('Recipe Journals', () => {

          it('Should show new journal on public recipe in feed', () => {
            cy
              .visit('/recipes/2')
              .waitForQuery('recipe')

              .get('[data-cy=comments-and-journals-section] a:contains("Journal")').click()
              .waitForQuery('recipeJournals')

              .setTinyMceContent('create-recipe-journal', 'Brand new recipe journal')
              .get('button:contains("Create Journal")').click()
              .waitForQuery('createRecipeJournal')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-recipe-journal]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("new Journal on Recipe Lavender")').should('exist')
                  .get('[data-cy=feed-details] a:contains("Lavender")').invoke('attr', 'href')
                  .should('contain', '/recipes/2');
              });
          });

          it('Should not show new private recipe in feed', () => {
            cy
              .visit('/recipes/1')
              .waitForQuery('recipe')

              .get('[data-cy=comments-and-journals-section] a:contains("Journal")').click()
              .waitForQuery('recipeJournals')

              .setTinyMceContent('create-recipe-journal', 'Brand new recipe journal')
              .get('button:contains("Create Journal")').click()
              .waitForQuery('createRecipeJournal')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-recipe-journal]').should('not.exist');
          });
        });

        context('Comments', () => {
          it('Should show comments on public recipes', () => {
            cy
              .visit('/recipes/2')
              .waitForQuery('recipe')

              .setTinyMceContent('add-commentable-comment', 'test comment')
              .get('button:contains("Comment")').should('not.be.disabled').click()
              .waitForQuery('createComment')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-comment]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("commented on Recipe")').should('exist')
                  .get('[data-cy=feed-details] a:contains("Lavender")').invoke('attr', 'href')
                  .should('contain', '/recipes/2');
              });
          });

          it('Should not show comments on private recipes', () => {
            cy
              .visit('/recipes/1')
              .waitForQuery('recipe')

              .setTinyMceContent('add-commentable-comment', 'test comment')
              .get('button:contains("Comment")').should('not.be.disabled').click()
              .waitForQuery('createComment')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-comment]').should('not.exist');
          });

          it('Should show comments on Forum post', () => {
            cy
              .visit('/posts/1')
              .waitForQuery('getPost')

              .setTinyMceContent('add-commentable-comment', 'test comment')
              .get('button:contains("Comment")').should('not.be.disabled').click()
              .waitForQuery('createComment').wait(100)

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-comment]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("commented on Post")').should('exist')
                  .get('[data-cy=feed-details] a:contains("this is the post content")').invoke('attr', 'href')
                  .should('contain', '/posts/1');
              });
          });

          it('Should show comments on an Oil post', () => {
            cy
              .visit('/posts/5')
              .waitForQuery('getPost')

              .setTinyMceContent('add-commentable-comment', 'test comment')
              .get('button:contains("Comment")').should('not.be.disabled').click()
              .waitForQuery('createComment').wait(100)

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-comment]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("commented on Post")').should('exist')
                  .get('[data-cy=feed-details] a:contains("oil post")').invoke('attr', 'href')
                  .should('contain', '/posts/5');
              });
          });
        });

        context('Posts', () => {
          it('Should show new forum posts', () => {
            cy
              .visit('/forums/1')
              .waitForQuery('postablePosts')

              .get('input[name=title]').type('new post')
              .setTinyMceContent('new-content', 'new post content')
              .get('button:contains("Post")').click()
              .waitForQuery('createForumPost')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-post]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("created a new Post")').should('exist')
                  .get('[data-cy=feed-details]:contains("Forum testforum")').should('exist')
                  .get('[data-cy=feed-details] a:contains("new post")').invoke('attr', 'href')
                  .should('contain', '/posts/7');
              });
          });

          it('Should show new oil posts', () => {
            cy
              .visit('/oils/1')
              .waitForQuery('postablePosts')

              .get('input[name=title]').type('new post')
              .setTinyMceContent('new-content', 'new post content')
              .get('button:contains("Post")').click()
              .waitForQuery('createPost')

              .pushHistory('/feed')
              .waitForQuery('getFeed')
              .get('[data-cy=feed-item-new-post]:first')
              .within(() => {
                cy
                  .get('[data-cy=feed-details]:contains("created a new Post")').should('exist')
                  .get('[data-cy=feed-details]:contains("Oil Abyssinian")').should('exist')
                  .get('[data-cy=feed-details] a:contains("new post")').invoke('attr', 'href')
                  .should('contain', '/posts/7');
              });
          });
        });
      });
    });
  });
});
