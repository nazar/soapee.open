describe('Authentication', () => {

  context('Facebook Account Recovery', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      it('Should send password reset email', () => {
        const email = 'recover@facebook.com';
        const newUsername = 'new-user-name';
        const newPassword = 'newpassword';

        let code;

        cy
          .resetEmails()
          .visit('/auth/facebook-recover')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type(email)
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendRecoverFacebookAccount')

              .get('.message:contains("Facebook Account Recovery Code sent")').should('exist');
          })

          .getLastEmail(email)
          .then(({ Content }) => {
            const [toEmailAddress] = Content.Headers.To;
            const [,resetCode] = Content.Body.match(/code: (.+)/);

            expect(toEmailAddress).to.equal(email);
            expect(resetCode).to.be.ok;

            code = resetCode;
          })

          .get('[data-cy=step-2-form]')
          .within(() => {
            cy
              .get('input[name=code]').type(code)
              .get('button[data-cy=verify-code]').click()
              .waitForQuery('verifyFacebookRecoveryCode');
          })

          .get('[data-cy=step-3-form]')
          .within(() => {
            cy
              .get('input[name=username]').type(newUsername)
              .get('input[name=newPassword]').type(newPassword)
              .get('input[name=confirmPassword]').type(newPassword)
              .get('button[data-cy=update-password]').click()
              .waitForQuery('convertFacebookAccountToLocalProvider')

              .get('.message:contains("Facebook Account recovered")').should('exist');
          })
          .pushHistory('/auth/login')
          .url().should('contain', 'auth/login')
          .get('input[name=username]').type(newUsername)
          .get('input[name=password]').type(newPassword)
          .get('button:contains("Login")').click()

          .waitForQuery('localUserLogin')
          .url().should('contain', '/settings');
      });

      it('Should show error message for not found email', () => {
        cy
          .visit('/auth/facebook-recover')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type('not.facebook@email.com')
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendRecoverFacebookAccount', { skipErrors: true })

              .get('.message:contains("Soapee was not able to find this Email Address against a facebook based login")').should('exist');
          });
      });

      it('Should show error message for bad code', () => {
        cy
          .visit('/auth/facebook-recover')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type('facebook@email.com')
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendRecoverFacebookAccount')
              .get('.message:contains("Facebook Account Recovery Code sent")').should('exist');
          })

          .get('[data-cy=step-2-form]')
          .within(() => {
            cy
              .get('input[name=code]').type('code-code')
              .get('button[data-cy=verify-code]').click()
              .waitForQuery('verifyFacebookRecoveryCode')
              .get('.message:contains("Facebook Account Recovery Code could not be verified.")').should('exist');
          });
      });
    });
  });
});
