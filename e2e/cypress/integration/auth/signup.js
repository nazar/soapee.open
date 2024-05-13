describe('Authentication', () => {
  context('Signup', () => {
    context('Queries', () => {
      before(() => cy.resetDb());

      it('Should warn if a username is taken', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazar')
          .get('input[name=password]').type('password')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup', { skipErrors: true })

          .get('.message:contains("Username nazar is taken")').should('exist')

          .get('input[name=username]').type('r')
          .get('.message:contains("Username nazarr is taken")').should('not.exist');
      });

      it('Should warn if a email is taken', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarrrr')
          .get('input[name=password]').type('password')
          .get('input[name=email]').type('forgot@email.com')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup', { skipErrors: true })

          .get('.message:contains("Email forgot@email.com is taken")').should('exist')
          .get('input[name=username]').type('m')
          .get('.message:contains("Email forgot@email.comm is taken")').should('not.exist');
      });

      it('Should warn if a email is taken by non local provider', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarrrr')
          .get('input[name=password]').type('password')
          .get('input[name=email]').type('facebook@email.com')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup', { skipErrors: true })

          .get('.message:contains("Email facebook@email.com is assigned to a Facebook login")').should('exist');
      });

      it('Should show error message for bad usernames', () => {
        cy
          .visit('/auth/signup')
          .get('input[name=username]').type('nazarrrr@')
          .get('.label:contains("Username can only include letters, numbers and underscores")').should('exist');
      });
    });

    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      it('Should signup without email', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarrr')
          .get('input[name=password]').type('passworddd')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup')

          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')
          .url().should('contain', '/settings');
      });

      it('Should signup with underscore name', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarr_r')
          .get('input[name=password]').type('passworddd')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup')

          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')
          .url().should('contain', '/settings');
      });

      it('Should allow - in usernames', () => {
        cy
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarr-r')
          .get('input[name=password]').type('passworddd')
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup')

          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')
          .url().should('contain', '/settings')

          .visitIncognito('/auth/login')
          .get('input[name=username]').type('nazarr-r')
          .get('input[name=password]').type('passworddd')
          .get('button:contains("Login")').click()
          .waitForQuery('localUserLogin')
          .url().should('contain', '/settings');
      });

      it('Should signup with email', () => {
        const email = 'test@email.com';
        const password = 'passworddd';

        cy
          .resetEmails()
          .visit('/auth/signup')

          .get('input[name=username]').type('nazarrr')
          .get('input[name=password]').type(password)
          .get('input[name=email]').type(email)
          .get('button:contains("Signup")').click()
          .waitForQuery('localSignup')

          .get('[data-cy=navlink-login]').should('not.exist')
          .get('[data-cy=user-menu]').should('exist')
          .url().should('contain', '/settings')

          .getLastEmail(email)
          .then(({ Content }) => {
            const [toEmailAddress] = Content.Headers.To;
            const [,emailPassword] = Content.Body.match(/password: (.+)/);

            expect(toEmailAddress).to.equal(email);
            expect(emailPassword).to.equal(password);
          });
      });
    });
  });
});
