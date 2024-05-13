describe('Recipes', () => {
  context('Recipes List', () => {
    context('Anonymous users', () => {
      context('Querying', () => {
        before(() => cy.resetDb());

        it('Should list 10 recipes per page', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')
            .get('.recipe').its('length').should('equal', 10)
            .get('[data-cy=modal-recipe-delete-button]').should('not.exist')

            .get('.recipe:contains("Glycerine Hand and Body Liquid Soap")').should('not.exist')
            .get('.recipe:contains("Trial Remedial Recipe 1")').should('not.exist')

            .get('[role=navigation]').should('exist')
            .within(() => {
              cy
                .get('[type=pageItem]:contains("1")').should('exist').and('have.class', 'active')
                .get('[type=pageItem]:contains("2")').should('exist').and('not.have.class', 'active')
                .get('[type=pageItem]:contains("3")').should('not.exist')
                .get('[type=pageItem]:contains("2")').click()
                .waitForQuery('recipes');
            })
            .get('.recipe').its('length').should('be.above', 0).and('be.below', 10)
            .then($recipeLength => {
              cy
                .reload()
                .get('.recipe').its('length').should('equal', $recipeLength);
            });
        });

        it('Should not show other private or other friend only recipes', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')
            .get('.recipe:contains("Glycerine Hand and Body Liquid Soap")').should('not.exist')
            .get('.recipe:contains("Trial Remedial Recipe 1")').should('not.exist')

            .visit('/recipes?page=2')
            .waitForQuery('recipes')
            .get('.recipe:contains("Glycerine Hand and Body Liquid Soap")').should('not.exist')
            .get('.recipe:contains("Trial Remedial Recipe 1")').should('not.exist');
        });

        it('Should not show user controls', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('button:contains("Favourite")').should('not.exist')
            .get('button:contains("Report")').should('not.exist')

            .get('.recipe [data-cy=stats-label-comments]').should('exist')
            .get('.recipe [data-cy=stats-label-comments]').should('exist');
        });

        it('Should search recipes by name', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy=recipe-search] input').type('shaving')
            .get('button:contains("Search")').click()

            .waitForQuery('recipes')
            .get('.recipe')
            .its('length')
            .then((recipeLength) => {
              cy
                .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength);
            })

            .get('[data-cy=recipe-search] input').type('{selectall}shave')
            .get('button:contains("Search")').click()
            .waitForQuery('recipes')
            .get('.recipe')
            .its('length')
            .then((recipeLength) => {
              cy
                .get('.recipe:contains("Shaving")').its('length').should('equal', recipeLength);
            });
        });

        it('Should search recipes by oils', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.title:contains("Filter by oils")').click()
            .get('div[name=oilIds]').type('Almond')
            .get('div[role=option]:contains("Almond Butter")').click()
            .get('div[name=oilIds] a.label').should('exist')
            .get('div[name=oilIds]').type('{esc}')
            .get('button:contains("Search")').click()

            .waitForQuery('recipes')
            .get('.recipe').its('length').should('equal', 3)
            .get('.recipe:contains("Lavender")').should('exist')
            .wait(100)

            .get('div[name=oilIds]').type('Abyssinian Oil')
            .get('div[role=option]:contains("Abyssinian Oil")').click()
            .get('div[name=oilIds]').type('{esc}')
            .get('button:contains("Search")').click()

            .waitForQuery('recipes')
            .get('.recipe').its('length').should('equal', 3)
            .get('.recipe:contains("Lavender")').should('exist')
            .wait(100)

            .get('button:contains("Reset")').click()
            .get('button:contains("Search")').click()
            .waitForQuery('recipes')

            .get('div[name=oilIds] a.label').should('not.exist')
            .get('.recipe').its('length').should('be.above', 1).and('be.below', 11);
        });

        it('Should show reactions but not update them', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy-recipe-id=17]')
            .within(() => {
              cy
                .get('[data-cy=reactions]').should('exist')
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
                .get('[data-cy=reactions] [data-cy=add-reaction]').should('not.exist');
            });
        });

        it('Should not show reaction row when no reactions present', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy-recipe-id=18] [data-cy=reactions]').should('not.exist');
        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb());

        it('Should prompt to login when attempting to vote', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy=recipe-summary]:first [data-cy=up-vote]').should('not.have.class', 'orange')
            .get('[data-cy=recipe-summary]:first [data-cy=up-vote]').click()
            .get('[data-cy=login-signup-modal]')
            .within(() => {
              cy
                .get('input[name=username]').type('nazar')
                .get('input[name=password]').type('password')
                .get('button:contains("Login")').click()
                .waitForQuery('localUserLogin');
            })

            .get('[data-cy=login-signup-modal]').should('not.exist')
            .get('[data-cy=recipe-summary]:first [data-cy=up-vote]').click()
            .waitForQuery('voteOnVoteable')
            .waitForQuery('recipe')

            .get('[data-cy=recipe-summary]:first [data-cy=up-vote]').should('have.class', 'orange');
        });
      });
    });

    context('Logged in users - admin user', () => {
      context('Querying', () => {
        before(() => cy.resetDb());
        beforeEach(() => cy.loginUser1());

        it('Should also list my private recipes', () => {
          cy
            .visit('/recipes?page=2')
            .waitForQuery('recipes')

            .get('.recipe:contains("HP Conditioning")').should('exist')
            .get('.recipe:contains("Coconut oil solid soap")').should('exist')

            .get('[role=alert]:contains("Best Recipes")').click()
            .get('div.menu div.item:contains("Newest first")').click()
            .waitForQuery('recipes')

            .get('.recipe:contains("Glycerine Hand and Body Liquid Soap")').should('exist')
            .get('.recipe:contains("Trial Remedial Recipe 1")').should('exist');
        });

        it('Should show user controls', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('button:contains("Favourite")').should('exist')
            .get('button:contains("Report")').should('exist')

            .get('.recipe [data-cy=stats-label-comments]').should('exist')
            .get('.recipe [data-cy=stats-label-comments]').should('exist');
        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser1());

        it('Should should allow user to vote on a recipe', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount") .voteable')
            .within(() => {
              cy
                .get('.score:contains("1")').should('exist')
                .get('.up-vote i.orange').should('not.exist')
                .get('.up-vote').click()
                .waitForQuery('voteOnVoteable');
            })

            .reload()
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount") .voteable')
            .within(() => {
              cy
                .get('.score:contains("2")').should('exist')
                .get('.up-vote i.orange').should('exist')
                .get('.up-vote').click()
                .waitForQuery('voteOnVoteable')

                .get('.score:contains("1")').should('exist')
                .get('.up-vote i.orange').should('not.exist')
                .get('.score:contains("1")').should('exist')
                .get('.up-vote i.orange').should('not.exist');
           });
        });

        it('Should should allow user to vote on a recipe in mobile view', () => {
          cy
            .viewport('iphone-x')
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount") .voteable')
            .within(() => {
              cy
                .get('.score:contains("1")').should('exist')
                .get('.up-vote i.orange').should('not.exist')
                .get('.up-vote').click()
                .waitForQuery('voteOnVoteable');
            })

            .reload()
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount") .voteable')
            .within(() => {
              cy
                .get('.score:contains("2")').should('exist')
                .get('.up-vote i.orange').should('exist')
                .get('.up-vote').click()
                .waitForQuery('voteOnVoteable')

                .get('.score:contains("1")').should('exist')
                .get('.up-vote i.orange').should('not.exist');
            });
        });

        it('Should favourite a recipe', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount")')
            .within(() => {
              cy
                .get('[data-cy=favourite-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleFavourite')

                .get('[data-cy=favourite-button]').should('have.class', 'active').click()
                .waitForQuery('toggleFavourite')

                .get('[data-cy=favourite-button]').should('not.have.class', 'active');
            });
        });

        it('Should report a recipe', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:contains("Recipie with waterDiscount")')
            .within(() => {
              cy
                .get('[data-cy=report-button]').should('not.have.class', 'active').click();
            })

            .get('[data-cy=report-content-modal]')
            .within(() => {
              cy
                .get('label:contains("Abusive")').click()
                .get('label:contains("Spam")').click()
                .get('textarea').type('Other info')
                .get('button:contains("Submit Report")').click();
            })
            .waitForQuery('reportReportable')

            .get('.recipe:contains("Recipie with waterDiscount")')
            .within(() => {
              cy
                .get('[data-cy=report-button]').should('have.class', 'active').click();
            })

            .get('[data-cy=report-content-modal]')
            .within(() => {
              cy
                .get('button:contains("Delete Report")').click();
            })
            .waitForQuery('reportReportable')

            .get('.recipe:contains("Recipie with waterDiscount")')
            .within(() => {
              cy
                .get('[data-cy=report-button]').should('not.have.class', 'active');
            });
        });

        it('Should mark a recipe as best', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:first').contains('TURMERIC & ROSE WATER').should('not.exist')
            .get('.recipe:contains("TURMERIC & ROSE WATER")')
            .within(() => {
              cy
                .get('[data-cy=best-button]').should('not.have.class', 'active').click()
                .waitForQuery('toggleBestRecipe')
                .reload()
                .waitForQuery('recipes');

            })
            .get('.recipe:first').contains('TURMERIC & ROSE WATER').should('exist')

            .get('.recipe:contains("TURMERIC & ROSE WATER")')
            .within(() => {
              cy
                .get('[data-cy=best-button]').should('have.class', 'active').click()
                .waitForQuery('toggleBestRecipe')
                .wait(100);
            })

            .get('.recipe:contains("TURMERIC & ROSE WATER")')
            .within(() => {
              cy
                .get('[data-cy=best-button]').should('not.have.class', 'active');
            });
        });

        it('Should untoggle best recipe', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy=recipe-summary]:contains("Master With Lard")')
            .within(() => {
              cy
                .get('button:contains("Best")').click()
                .waitForQuery('toggleBestRecipe')
                .reload()
                .waitForQuery('recipes');
            })

            .get('[data-cy=recipe-summary]:first').contains('Recipie with waterDiscount').should('exist');
        });
      });
    });

    context('Logged in users - non-admin user', () => {
      context('Queries', () => {
        before(() => cy.resetDb().loginUser2());

        it('Should not show best button', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('.recipe:contains("TURMERIC & ROSE WATER")')
            .within(() => {
              cy
                .get('[data-cy=best-button]').should('not.exist');
            });
        });
      });

      context('Mutations', () => {
        beforeEach(() => cy.resetDb().loginUser2());

        it('Should show reactions and update them', () => {
          cy
            .visit('/recipes')
            .waitForQuery('recipes')

            .get('[data-cy-recipe-id=17]')
            .within(() => {
              cy
                .get('[data-cy=reactions]').should('exist')
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
                .get('[data-cy=reactions] [data-cy=add-reaction]').should('exist').click();
            })

            .get('[data-cy=reaction-emoji-picker] button[aria-label="👍, +1, thumbsup"]:first').click()
            .waitForQuery('toggleReaction')
            .waitForQuery('recipe')

            .get('[data-cy=reaction-emoji-picker]').should('not.exist')
            .get('[data-cy-recipe-id=17]')
            .within(() => {
              cy
                .get('[data-cy=reactions] [data-cy=reaction-emoji]').its('length').should('equal', 4)
                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('have.class', 'mine')
                .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("2")').should('exist').click()
                .waitForQuery('toggleReaction')
                .waitForQuery('recipe')

                .get('[data-cy=reaction-emoji] span[title="+1"]').parent().should('not.have.class', 'mine')
                .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("2")').should('not.exist')
                .get('[data-cy=reaction-emoji] span[title="+1"]').siblings('.counter:contains("1")').should('exist');
            });
        });
      });
    });
  });
});
