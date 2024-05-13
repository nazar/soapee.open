import jwt from 'jsonwebtoken';
import cookies from 'js-cookie';
import { addHours, addDays } from 'date-fns';

describe('Authentication', () => {
  context('Login', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      it('Should log in using username and password - session token', () => {
        cy
          .visit('/auth/login')

          .get('[data-cy=navlink-login]').should('exist')
          .get('[data-cy=user-menu]').should('not.exist')
          .get('input[name=username]').type('nazar')
          .get('input[name=password]').type('password')
          .get('button:contains("Login")').click()

          .waitForQuery('localUserLogin')
          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')

          .reload()
          .waitForQuery('me')
          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')

          .then(async () => {
            const cookie = cookies.get('soapee-token');
            const { rememberMe, exp } = await jwt.verify(cookie, Cypress.env('JWT_SECRET'));

            expect(rememberMe).to.be.undefined;
            expect(new Date(exp * 1000)).to.be.below(addHours(new Date(), 48));
          });
      });

      it('Should log in using username and password - remember me', () => {
        cy
          .visit('/auth/login')

          .get('[data-cy=navlink-login]').should('exist')
          .get('[data-cy=user-menu]').should('not.exist')
          .get('[data-cy=remember-me]').click()
          .get('[data-cy=remember-me] input').should('be.checked')

          .get('input[name=username]').type('nazar')
          .get('input[name=password]').type('password')
          .get('button:contains("Login")').click()

          .waitForQuery('localUserLogin')
          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')

          .reload()
          .waitForQuery('me')
          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')

          .then(async () => {
            const cookie = cookies.get('soapee-token');
            const { rememberMe, exp } = await jwt.verify(cookie, Cypress.env('JWT_SECRET'));

            expect(rememberMe).to.be.true;
            expect(new Date(exp * 1000)).to.be.above(addDays(new Date(), 29));
          });
      });

      it('Should ustilise remember me from the login modal', () => {
        cy
          .visit('/recipes')
          .waitForQuery('recipes')

          .get('[data-cy-recipe-id=18] [data-cy=up-vote]').click()
          .get('[data-cy=login-signup-modal]')
          .within(() => {
            cy
              .get('[data-cy=remember-me]').click()
              .get('[data-cy=remember-me] input').should('be.checked')

              .get('input[name=username]').type('nazar')
              .get('input[name=password]').type('password')
              .get('button:contains("Login")').click()

              .waitForQuery('localUserLogin');
          })

          .reload()
          .waitForQuery('me')
          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')

          .then(async () => {
            const cookie = cookies.get('soapee-token');
            const { rememberMe, exp } = await jwt.verify(cookie, Cypress.env('JWT_SECRET'));

            expect(rememberMe).to.be.true;
            expect(new Date(exp * 1000)).to.be.above(addDays(new Date(), 29));
          });
      });
    });

    context('Queries', () => {
      before(() => cy.resetDb());

      it('Should detect when a login token has expired and renew the token', () => {
        cy
          .loginUser1ShortToken()
          .visit('/settings')
          .url().should('contain', '/settings')
          .waitForQuery('renewToken')
          .wait(2000)

          .url().should('contain', '/settings')
          .then(async () => {
            const cookie = cookies.get('soapee-token');
            const { rememberMe, exp } = await jwt.verify(cookie, Cypress.env('JWT_SECRET'));

            expect(rememberMe).to.be.undefined;
            expect(new Date(exp * 1000)).to.be.above(addHours(new Date(), 47));
          });

      });

      it('Should handle expired tokens', () => {
        cookies.set('soapee-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInByb3ZpZGVyTmFtZSI6ImxvY2FsIiwiaWF0IjoxNjE1OTc3NDc2LCJleHAiOjE2MTU5Nzc0NzZ9.QJZoi-Dtl1q2cFE-tX3U83n25Jz1UpsvrCtElDSYMv8');

        cy
          .visit('/settings')
          .waitForQuery('me')
          .url().should('contain', '/auth/login')

          .visit('/recipes/1')
          .waitForQuery('recipe', { skipErrors: true })
          .get('div:contains("Recipe is private")').should('exist');
      });

      context('Error messages', () => {

        it('Should show error message when username not found', () => {
          cy
            .visit('/auth/login')

            .get('input[name=username]').type('nazarr')
            .get('input[name=password]').type('password')
            .get('button:contains("Login")').click()
            .waitForQuery('localUserLogin', { skipErrors: true })

            .get('.message:contains("Username nazarr was not found")').should('exist')
            .get('input[name=username]').type('r')
            .get('.message:contains("Username nazarrr was not found")').should('not.exist');
        });

        it('Should show error message for wrong password', () => {
          cy
            .visit('/auth/login')

            .get('input[name=username]').type('nazar')
            .get('input[name=password]').type('passwordd')
            .get('button:contains("Login")').click()
            .waitForQuery('localUserLogin', { skipErrors: true })

            .get('.message:contains("Wrong password was entered for user nazar")').should('exist')
            .get('input[name=password]').type('d')
            .get('.message:contains("Wrong password was entered for user nazar")').should('not.exist');
        });

        it('Should show error message for invalid logins', () => {
          cy
            .visit('/auth/login')

            .get('input[name=username]').type('genuveskin@gmail.com')
            .get('.label:contains("Username can only include letters, numbers and underscores")').should('exist');
        });
      });
    });
  });
});
