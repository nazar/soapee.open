import { selectOilAndSetWeight } from 'e2e/cypress/utils/calculatorHelpers';

describe('Users', () => {

  context('Settings', () => {

    context('Queries', () => {
      before(() => cy.resetDb());

      context('Logged in', () => {
        beforeEach(() => cy.loginUser1());

        context('My Recipes', () => {
          beforeEach(() => cy.visit('/settings/recipes'));

          it('Should load my recipes', () => {
            cy
              .waitForQuery('myRecipesSummary')

              .get('[data-cy=recipe-summary]').its('length').should('be.above', 0)
              .get('[data-cy=recipe-summary]')
              .then((summaries) => {
                cy
                  .get('.user-info:contains("Nazar Aziz")').its('length').should('equal', summaries.length);
              });
          });

          it('Should sort my Recipes', () => {
            cy
              .waitForQuery('myRecipes')

              .get('[data-cy=recipe-summary]:first:contains("Glycerine Hand and Body")').should('exist')

              .get('[role=alert]:contains("Recently Updated")').click()
              .get('div.menu div.item:contains("Newest first")').click()
              .waitForQuery('myRecipes')

              .get('[data-cy=recipe-summary]:first:contains("Shaving Soap")').should('exist')
              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .waitForQuery('myRecipes')
              .get('[data-cy=recipe-summary]:last:contains("Shaving Soap")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Name ascending")').click()
              .waitForQuery('myRecipes')
              .get('[data-cy=recipe-summary]:first:contains("Basic Grocery Store")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Name descending")').click()
              .waitForQuery('myRecipes')
              .get('[data-cy=recipe-summary]:last:contains("Basic Grocery Store")').should('exist');
          });

          it('Should search my recipes by name', () => {
            cy
              .waitForQuery('myRecipes')

              .get('[data-cy=recipe-search] input').type('shaving')
              .get('button:contains("Search")').click()

              .waitForQuery('myRecipes')
              .get('.recipe')
              .its('length')
              .then((recipeLength) => {
                cy
                  .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength);
              })

              .get('[data-cy=recipe-search] input').type('{selectall}shave')
              .get('button:contains("Search")').click()
              .waitForQuery('myRecipes')
              .get('.recipe')
              .its('length')
              .then((recipeLength) => {
                cy
                  .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength);
              });
          });

          it('Should search recipes by oils', () => {
            cy
              .waitForQuery('myRecipes')

              .get('.title:contains("Filter by oils")').click()
              .get('div[name=oilIds]').type('Almond')
              .get('div[role=option]:contains("Almond Butter")').click()
              .get('div[name=oilIds] a.label').should('exist')
              .get('div[name=oilIds]').type('{esc}')
              .get('button:contains("Search")').click()

              .waitForQuery('myRecipes')
              .get('.recipe').its('length').should('equal', 4)
              .get('.recipe:contains("Lavender")').should('exist')
              .wait(100)

              .get('div[name=oilIds]').type('Abyssinian Oil')
              .get('div[role=option]:contains("Abyssinian Oil")').click()
              .get('div[name=oilIds]').type('{esc}')
              .get('button:contains("Search")').click()

              .waitForQuery('myRecipes')
              .get('.recipe').its('length').should('equal', 4)
              .get('.recipe:contains("Lavender")').should('exist')
              .wait(100)

              .get('button:contains("Reset")').click()
              .get('button:contains("Search")').click()
              .waitForQuery('myRecipes')

              .get('div[name=oilIds] a.label').should('not.exist')
              .get('.recipe').its('length').should('be.above', 1).and('be.below', 11);
          });
        });

        context('My Additives', () => {
          beforeEach(() => cy.visit('/settings/additives'));

          it('Should show my additives', () => {
            cy
              .waitForQuery('myAdditivesSummary')

              .get('[data-cy=sort-order-bar]:contains("Name ascending")').should('exist')
              .get('[data-cy=my-additive-row]:first:contains("pepper")').should('exist')
              .get('[data-cy=my-additive-row]:last:contains("salt")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Most")').click()
              .waitForQuery('myAdditives')

              .get('[data-cy=my-additive-row]').its('length').should('equal', 2);
          });

          it('Should show related recipes', () => {
            cy
              .waitForQuery('myAdditivesSummary')

              .get('[data-cy=my-additive-row]:contains("salt") a').click()
              .waitForQuery('myAdditiveRecipes')

              .get('[data-cy=recipe-summary]').its('length').should('equal', 1)
              .get('[data-cy-recipe-id=20]').should('exist');
          });
        });

        context('My Posts', () => {
          beforeEach(() => cy.visit('/settings/posts'));

          it('Should load my posts', () => {
            cy
              .waitForQuery('myPostsSummary')

              .get('[data-cy=post]').its('length').should('be.above', 0)
              .get('[data-cy=post]')
              .then(posts => {
                cy
                  .get('.user-info:contains("Nazar Aziz")').its('length').should('equal', posts.length);
              });
          });

          it('Should sort my Posts', () => {
            cy
              .waitForQuery('myPosts')

              .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
              .get('[data-cy=post]:first:contains("oil post")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .get('[data-cy=post]:last:contains("forum post in forum 3")').should('exist');
          });

          it('Should show context button on my posts', () => {
            cy
              .waitForQuery('myPosts')

              .get('[data-cy=post-context-button]').its('length').should('equal', 5);
          });
        });

        context('My Comments', () => {
          beforeEach(() => cy.visit('/settings/comments'));

          it('Should load my comments', () => {
            cy
              .waitForQuery('myCommentsSummary')

              .get('[data-cy=comment]').its('length').should('be.above', 0);
          });

          it('Should sort my comments', () => {
            cy
              .waitForQuery('myComments')

              .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
              .get('[data-cy=comment]:first:contains("What would this soap be for?")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .get('[data-cy=comment]:last:contains("What would this soap be for?")').should('exist');
          });

          it('Should show context button comments', () => {
            cy
              .waitForQuery('myComments')

              .get('[data-cy=comment-context-button]').its('length').should('equal', 6);
          });
        });

        context('My Forums', () => {
          beforeEach(() => cy.visit('/settings/forums'));

          it('Should load my forums', () => {
            cy
              .waitForQuery('myForumsSummary')

              .get('[data-cy=forum-summary-row]').its('length').should('equal', 2);
          });
        });

        context('My Subscribed Forums', () => {
          beforeEach(() => cy.visit('/settings/subscribed-forums'));

          it('Should load my Subscribed Forums', () => {
            cy
              .waitForQuery('mySubscribedForumsSummary')

              .get('[data-cy=forum-summary-row]').its('length').should('equal', 2);
          });
        });

        context('My Favourite Recipes', () => {
          beforeEach(() => cy.visit('/settings/favourites/recipes'));

          it('Should load my favourite recipes', () => {
            cy
              .waitForQuery('myFavouriteRecipesSummary')

              .get('[data-cy=recipe-summary]').its('length').should('equal', 8)
              .get('[data-cy=recipe-summary]')
              .then((summary) => {
                cy
                  .get('[data-cy=recipe-summary] button.active[data-cy=favourite-button]')
                  .its('length').should('equal', summary.length);
              });
          });

          it('Should sort my Favourite Recipes', () => {
            cy
              .waitForQuery('myFavouriteRecipes')

              .get('[data-cy=recipe-summary]:first:contains("French Green Clay")').should('exist')

              .get('[role=alert]:contains("Recently Updated")').click()
              .get('div.menu div.item:contains("Newest first")').click()
              .waitForQuery('myFavouriteRecipes')

              .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
              .get('[data-cy=recipe-summary]:first:contains("French Green")').should('exist')
              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .waitForQuery('myFavouriteRecipes')
              .get('[data-cy=recipe-summary]:last:contains("French")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Name ascending")').click()
              .waitForQuery('myFavouriteRecipes')
              .get('[data-cy=recipe-summary]:first:contains("Basic Grocery Store Moisturizing Bar")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Name descending")').click()
              .waitForQuery('myFavouriteRecipes')
              .get('[data-cy=recipe-summary]:last:contains("Basic Grocery Store Moisturizing Bar")').should('exist');
          });

          it('Should search my favourite recipes by name', () => {
            cy
              .waitForQuery('myFavouriteRecipes')

              .get('[data-cy=recipe-search] input').type('shaving')
              .get('button:contains("Search")').click()

              .waitForQuery('myFavouriteRecipes')
              .get('.recipe')
              .its('length')
              .then((recipeLength) => {
                cy
                  .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength)
                  .get('.active[data-cy=favourite-button]').its('length').should('equal', recipeLength);
              })

              .get('[data-cy=recipe-search] input').type('{selectall}shave')
              .get('button:contains("Search")').click()
              .waitForQuery('myFavouriteRecipes')
              .get('.recipe')
              .its('length')
              .then((recipeLength) => {
                cy
                  .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength)
                  .get('.active[data-cy=favourite-button]').its('length').should('equal', recipeLength);
              });
          });

          it('Should search recipes by oils', () => {
            cy
              .waitForQuery('myFavouriteRecipes')

              .get('.title:contains("Filter by oils")').click()
              .get('div[name=oilIds]').type('Almond')
              .get('div[role=option]:contains("Almond Butter")').click()
              .get('div[name=oilIds] a.label').should('exist')
              .get('div[name=oilIds]').type('{esc}')
              .get('button:contains("Search")').click()

              .waitForQuery('myFavouriteRecipes')
              .get('.recipe').its('length').should('equal', 2)
              .get('.active[data-cy=favourite-button]').its('length').should('equal', 2)
              .get('.recipe:contains("Lavender")').should('exist')
              .wait(100)

              .get('div[name=oilIds]').type('Abyssinian Oil')
              .get('div[role=option]:contains("Abyssinian Oil")').click()
              .get('div[name=oilIds]').type('{esc}')
              .get('button:contains("Search")').click()

              .waitForQuery('myFavouriteRecipes')
              .get('.recipe').its('length').should('equal', 2)
              .get('.active[data-cy=favourite-button]').its('length').should('equal', 2)
              .get('.recipe:contains("Lavender")').should('exist')
              .wait(100)

              .get('button:contains("Reset")').click()
              .get('button:contains("Search")').click()
              .waitForQuery('myFavouriteRecipes')

              .get('div[name=oilIds] a.label').should('not.exist')
              .get('.recipe').its('length').should('be.above', 1).and('be.below', 11);
          });
        });

        context('My Favourite Posts', () => {
          beforeEach(() => cy.visit('/settings/favourites/posts'));

          it('Should load my favourite posts', () => {
            cy
              .waitForQuery('myFavouritePostsSummary')

              .get('[data-cy=post]').its('length').should('be.above', 0);
          });

          it('Should sort my Favourite Posts', () => {
            cy
              .waitForQuery('myFavouritePosts')

              .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
              .get('[data-cy=post]:first:contains("locked post")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .get('[data-cy=post]:last:contains("locked post")').should('exist');
          });

          it('Should show not context button on posts', () => {
            cy
              .waitForQuery('myFavouritePostsSummary')
              .get('[data-cy=post-context-button]').its('length').should('equal', 2);
          });

        });

        context('My Favourite Comments', () => {
          beforeEach(() => cy.visit('/settings/favourites/comments'));

          it('Should load my favourite comments', () => {
            cy
              .waitForQuery('myFavouriteCommentsSummary')

              .get('[data-cy=comment]').its('length').should('be.above', 0);
          });

          it('Should sort my favourite comments', () => {
            cy
              .waitForQuery('myFavouriteComments')

              .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
              .get('[data-cy=comment]:first:contains("The original recipe dose have soy")').should('exist')

              .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
              .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
              .get('[data-cy=comment]:last:contains("The original recipe dose have soy")').should('exist');
          });

          it('Should show context button comments', () => {
            cy
              .waitForQuery('myFavouriteComments')

              .get('[data-cy=comment-context-button]').its('length').should('equal', 2);
          });
        });

        context('My Friends', () => {
          context('My Friends Recipes', () => {
            beforeEach(() => cy.visit('/settings/friends-recipes'));

            it('Should load my friends recipes', () => {
              cy
                .waitForQuery('myFriendsRecipes')

                .get('[data-cy=recipe-summary]').its('length').should('equal', 2)
                .get('[data-cy=recipe-summary]');
            });

            it('Should sort my friends Recipes', () => {
              cy
                .waitForQuery('myFriendsRecipes')

                .get('[data-cy=recipe-summary]:first:contains("Master With Lard")').should('exist')

                .get('[role=alert]:contains("Recently Updated")').click()
                .get('div.menu div.item:contains("Newest first")').click()
                .waitForQuery('myFriendsRecipes')

                .get('[data-cy=sort-order-bar] .text:contains("Newest first")').should('be.visible')
                .get('[data-cy=recipe-summary]:first:contains("Master With Lard")').should('exist')
                .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
                .get('[data-cy=sort-order-bar] [role=option]:contains("Oldest first")').click()
                .waitForQuery('myFriendsRecipes')
                .get('[data-cy=recipe-summary]:last:contains("Master With Lard")').should('exist')

                .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
                .get('[data-cy=sort-order-bar] [role=option]:contains("Name ascending")').click()
                .waitForQuery('myFriendsRecipes')
                .get('[data-cy=recipe-summary]:first:contains("Master With Lard")').should('exist')

                .get('[data-cy=sort-order-bar] [data-cy=dropdown]').click()
                .get('[data-cy=sort-order-bar] [role=option]:contains("Name descending")').click()
                .waitForQuery('myFriendsRecipes')
                .get('[data-cy=recipe-summary]:last:contains("Master With Lard")').should('exist');
            });

            it('Should search my friends recipes by name', () => {
              cy
                .waitForQuery('myFriendsRecipes')

                .get('[data-cy=recipe-search] input').type('trial')
                .get('button:contains("Search")').click()

                .waitForQuery('myFriendsRecipes')
                .get('.recipe')
                .its('length')
                .then((recipeLength) => {
                  cy
                    .get('.recipe:contains("Trial")').its('length').should('equal', recipeLength);
                })

                .get('[data-cy=recipe-search] input').type('{selectall}lard')
                .get('button:contains("Search")').click()
                .waitForQuery('myFriendsRecipes')
                .get('.recipe')
                .its('length')
                .then((recipeLength) => {
                  cy
                    .get('.recipe:contains("Lard")').its('length').should('equal', recipeLength);
                });
            });

            it('Should search recipes by oils', () => {
              cy
                .waitForQuery('myFriendsRecipes')

                .get('.title:contains("Filter by oils")').click()
                .get('div[name=oilIds]').type('Lard')
                .get('div[role=option]:contains("Pig Tallow")').click()
                .get('div[name=oilIds] a.label').should('exist')
                .get('div[name=oilIds]').type('{esc}')
                .get('button:contains("Search")').click()

                .waitForQuery('myFriendsRecipes')
                .get('.recipe').its('length').should('equal', 1)
                .get('.recipe:contains("Lard")').should('exist')
                .wait(100)

                .get('div[name=oilIds]').type('Castor oil')
                .get('div[role=option]:contains("Castor Oil")').click()
                .get('div[name=oilIds]').type('{esc}')
                .get('button:contains("Search")').click()

                .waitForQuery('myFriendsRecipes')
                .get('.recipe').its('length').should('equal', 1)
                .get('.recipe:contains("Lard")').should('exist')
                .wait(100)

                .get('button:contains("Reset")').click()
                .get('button:contains("Search")').click()
                .waitForQuery('myFriendsRecipes')

                .get('div[name=oilIds] a.label').should('not.exist')
                .get('.recipe').its('length').should('be.above', 1).and('be.below', 11);
            });
          });

          context('Approved Friends', () => {
            it('Should load my approved friends', () => {
              cy
                .visit('/settings/friends')
                .waitForQuery('myFriends')

                .get('[data-cy=user-card]').its('length').should('equal', 1)
                .get('[data-cy=user-card]:contains("Aziz Nazar")').should('exist');
            });
          });

          context('Pending Friend Requests', () => {
            it('Should load my pending friend requests', () => {
              cy
                .visit('/settings/friends-pending')
                .waitForQuery('myIncomingPendingFriends')

                .get('[data-cy=user-card]').its('length').should('equal', 1)
                .get('[data-cy=user-card]:contains("Stranger Danger")').should('exist');
            });
          });
        });
      });

      context('User 3', () => {
        beforeEach(() => cy.loginUser3());

        context('My Comments on private recipes', () => {
          beforeEach(() => cy.visit('/settings/comments'));

          it('Should load my comments', () => {
            cy
              .waitForQuery('myCommentsSummary')
              .get('[data-cy=comment]').its('length').should('equal', 2)
              .get('[data-cy=comment]:contains("Spam")').should('exist');
          });

          it('Should show context button comments', () => {
            cy
              .waitForQuery('myCommentsSummary')

              .get('[data-cy=comment-context-button]').its('length').should('equal', 2);
          });
        });
      });

      context('Not logged in', () => {
        it('Should redirect to login when not logged in', () => {
          cy
            .visit('/settings')
            .url().should('contain', '/auth/login');
        });
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb().loginUser1());

      context('Update my details', () => {
        beforeEach(() => cy.visit('/settings'));

        it('Should update my details', () => {
          cy
            .waitForQuery('me')

            .get('input[name=name]').type('{selectall}edited name')
            .get('input[name=email]').type('mcnazar@gmail.com')
            .setTinyMceContent('about', 'Updated about me')
            .get('button:contains("Save")').click()
            .waitForQuery('updateMe')

            .reload()
            .waitForQuery('me')

            .get('input[name=name]').should('have.value', 'edited name')
            .get('input[name=email]').should('have.value', 'mcnazar@gmail.com')
            .getTinyMceContent('about').should('contain', 'Updated about me');
        });

        it('Should update my password', () => {
          cy
            .waitForQuery('me')
            .get('input[name=currentPassword]').type('password')
            .get('input[name=newPassword]').type('newpassword')
            .get('input[name=confirmPassword]').type('newpassword')
            .get('button:contains("Update Password")').click()
            .waitForQuery('updatePassword')

            .get('.message:contains("Password updated successfully")').should('exist');
        });

        it('Should show password mimatched error', () => {
          cy
            .waitForQuery('me')
            .get('input[name=currentPassword]').type('bad_password')
            .get('input[name=newPassword]').type('newpassword')
            .get('input[name=confirmPassword]').type('newpassword')
            .get('button:contains("Update Password")').click()
            .waitForQuery('updatePassword', { skipErrors: true })

            .get('.message:contains("The entered Password doesn\'t match your existing password")').should('exist');
        });

        it('Should update my profile image', () => {
          cy
            .waitForQuery('me')

            .get('[data-cy=user-card] img').invoke('attr', 'src').should('not.contain', 'liquid-soap')
            .get('[data-cy=profile-image-upload-button]').should('be.visible')
            .get('[data-cy=profile-image-upload-input]').attachFile('images/liquid-soap.jpeg')

            .get('[data-cy=profile-image-update-button]').click()
            .get('[data-cy=user-card] img').invoke('attr', 'src').should('contain', 'imageables/user_profile/000/000/002');
        });

        it('Should delete my account', () => {
          cy
            .waitForQuery('me')
            .get('button[data-cy=delete-account]').click()
            .get('button[data-cy=confirm-delete-account]').click()
            .waitForQuery('deleteMyAccount')

            .pushHistory('/auth/login')

            .get('input[name=username]').type('nazar')
            .get('input[name=password]').type('password')
            .get('button:contains("Login")').click()

            .waitForQuery('localUserLogin', { skipErrors: true })
            .get('.message:contains("Username nazar was deleted")').should('exist');
        });
      });

      context('My Recipes', () => {
        beforeEach(() => cy.visit('/settings/recipes'));

        it('Should delete my recipe', () => {
          cy
            .waitForQuery('myRecipes').wait(100)

            .get('[data-cy=recipe-summary]:contains("Shaving Soap")')
            .within(() => {
              cy
                .get('[data-cy=modal-recipe-delete-button]').click();
            })

            .get('[data-cy=delete-recipe-modal]')
            .within(() => {
              cy
                .get('button:contains("Delete")').click()
                .waitForQuery('deleteRecipe');
            })

            .get('[data-cy=delete-recipe-modal]').should('not.exist')
            .get('[data-cy=recipe-summary]:contains("Shaving Soap")').should('not.exist')

            .reload()
            .waitForQuery('myRecipes')
            .get('[data-cy=recipe-summary]:contains("Shaving Soap")').should('not.exist')

            .pushHistory('/recipes/10')
            .waitForQuery('recipe', { skipErrors: true })
            .get('.segment:contains("deleted")').should('exist');
        });
      });

      context('My Additives', () => {
        beforeEach(() => cy.visit('/settings/additives'));

        it('Should add an additive', () => {
          cy
            .waitForQuery('myAdditivesSummary')
            .get('[data-cy=add-additive]').click()
            .url().should('contain', '/additives/create')

            .get('[data-cy=my-additive-form]')
            .within(() => {
              cy
                .get('input[name=name]').type('mango')
                .setTinyMceContent('additive-notes', 'these are additive notes')
                .get('button:contains("Save")').click()
                .waitForQuery('createAdditive')
                .waitForQuery('myAdditives');
            })
            .get('[data-cy=my-additive-row]:first:contains("mango")').should('exist');
        });

        it('Should update an additive', () => {
          cy
            .waitForQuery('myAdditivesSummary')
            .get('a:contains("salt")').click()
            .waitForQuery('getMyAdditive')

            .get('[data-cy=my-additive-form]')
            .within(() => {
              cy
                .get('input[name=name]').should('have.value', 'salt').type('{selectAll}Salt')
                .setTinyMceContent('additive-notes', 'these are additive notess')
                .get('button:contains("Save")').click()
                .waitForQuery('updateMyAdditive')
                .waitForQuery('myAdditives');
            })
            .get('[data-cy=my-additive-row]:last:contains("Salt")').should('exist');
        });

        it('Should handle duplicate additive names when creating', () => {
          cy
            .waitForQuery('myAdditivesSummary')
            .get('[data-cy=add-additive]').click()
            .url().should('contain', '/additives/create')

            .get('[data-cy=my-additive-form]')
            .within(() => {
              cy
                .get('input[name=name]').type('Salt')
                .get('button:contains("Save")').click()
                .waitForQuery('createAdditive', { skipErrors: true })
                .get('[data-cy=error-name-exists]').should('exist');
            });
        });

        it('Should handle duplicate additive names when editing', () => {
          cy
            .waitForQuery('myAdditivesSummary')
            .get('a:contains("pepper")').click()
            .waitForQuery('getMyAdditive')

            .get('[data-cy=my-additive-form]')
            .within(() => {
              cy
                .get('input[name=name]').type('{selectAll}Salt')
                .get('button:contains("Save")').click()
                .waitForQuery('updateMyAdditive', { skipErrors: true })
                .get('[data-cy=error-name-exists]').should('exist');
            });
        });

        it('Should delete additives', () => {
          cy
            .waitForQuery('myAdditivesSummary')
            .get('a:contains("pepper")').click()
            .waitForQuery('getMyAdditive')

            .get('[data-cy=delete-button]').should('be.disabled')

            .pushHistory('/settings/additives/create')
            .get('h2:contains("Add Additive")').should('exist')
            .get('[data-cy=delete-button]').should('not.exist')

            .get('[data-cy=my-additive-form]')
            .within(() => {
              cy
                .get('input[name=name]').type('mango')
                .setTinyMceContent('additive-notes', 'these are mango notes')
                .get('button:contains("Save")').click()
                .waitForQuery('createAdditive')
                .waitForQuery('myAdditives');
            })
            .get('[data-cy=my-additive-row]:contains("mango") a').click()
            .waitForQuery('getMyAdditive')
            .get('[data-cy=delete-button]').should('not.be.disabled').click()
            .waitForQuery('deleteMyAdditive')
            .waitForQuery('myAdditivesSummary')

            .get('[data-cy=my-additive-row]:contains("mango")').should('not.exist');
        });
      });

      context('My Friends', () => {
        context('Approved Friends', () => {
          beforeEach(() => cy.visit('/settings/friends'));

          it('Should unfriend a friend', () => {
            cy
              .waitForQuery('myFriends')
              .get('[data-cy=user-card]').its('length').should('be.above', 0)
              .get('[data-cy=user-card]:first button:contains("Unfriend")').click()
              .waitForQuery('removeFriendLink')
              .waitForQuery('myFriends')

              .get('[data-cy=user-card]').should('not.exist')
              .get('.message:contains("No friends yet")').should('exist');
          });
        });

        context('Pending Friends', () => {
          beforeEach(() => cy.visit('/settings/friends-pending'));

          it('Should accept a friend request', () => {
            cy
              .waitForQuery('myIncomingPendingFriends')
              .get('[data-cy=user-card]').its('length').should('be.above', 0)
              .get('[data-cy=user-card]:contains("Stranger Danger") button:contains("Approve")').click()
              .waitForQuery('makeFriendLink')
              .waitForQuery('myIncomingPendingFriends')

              .get('[data-cy=user-card]').should('not.exist')
              .get('.message:contains("No friend requests yet")').should('exist')

              .pushHistory('/settings/friends')
              .waitForQuery('myFriends')
              .get('[data-cy=user-card]:contains("Stranger Danger")').should('exist');
          });

          it('Should reject a friend request', () => {
            cy
              .waitForQuery('myIncomingPendingFriends')
              .get('[data-cy=user-card]').its('length').should('be.above', 0)
              .get('[data-cy=user-card]:contains("Stranger Danger") button:contains("Decline")').click()
              .waitForQuery('removeFriendLink')
              .waitForQuery('myIncomingPendingFriends')

              .get('[data-cy=user-card]').should('not.exist')
              .get('.message:contains("No friend requests yet")').should('exist');
          });
        });
      });

      context('Caching', () => {
        it('Should show newly added recipes in my recipes', () => {
          cy
            .visit('/settings/recipes')
            .waitForQuery('myRecipes')

            .pushHistory('/calculator');

          selectOilAndSetWeight('Cocoa Butter', '70.00');
          selectOilAndSetWeight('Coconut Oil, 76 deg', '30');

          cy
            .get('[data-cy=recipe-name] input').type('My Recipe Name')
            .setTinyMceContent('recipe-description', 'Recipe description')
            .setTinyMceContent('recipe-notes', 'Recipe notes')

            .get('button:contains("Save Recipe")').click()
            .waitForQuery('createRecipe')

            .pushHistory('/settings/recipes')
            .waitForQuery('myRecipes')
            .get('[data-cy=recipe-summary]:contains("My Recipe Name")').should('exist');
        });
      });
    });
  });
});
