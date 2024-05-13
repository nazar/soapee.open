describe('Authentication', () => {

  context('Forgot Password', () => {
    context('Mutations', () => {
      beforeEach(() => cy.resetDb());

      it('Should send password reset email', () => {
        const email = 'forgot@email.com';
        let code;

        cy
          .resetEmails()
          .visit('/auth/forgot')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type(email)
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendResetEmailPassword')

              .get('.message:contains("Password Reset Email sent")').should('exist');
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
              .waitForQuery('verifyPasswordResetCode');
          })

          .get('[data-cy=step-3-form]')
          .within(() => {
            const newPassword = 'newpassword';

            cy
              .get('input[name=newPassword]').type(newPassword)
              .get('input[name=confirmPassword]').type(newPassword)
              .get('button[data-cy=update-password]').click()
              .waitForQuery('updatePasswordWithVerificationToken')

              .get('.message:contains("Password has been reset")').should('exist');
          })
          .pushHistory('/auth/login')
          .url().should('contain', 'auth/login')
          .get('input[name=username]').type('forgot')
          .get('input[name=password]').type('newpassword')
          .get('button:contains("Login")').click()

          .waitForQuery('localUserLogin')
          .url().should('contain', '/settings');
      });

      it('Should show error message for not found email', () => {
        cy
          .visit('/auth/forgot')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type('not.forgot@email.com')
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendResetEmailPassword', { skipErrors: true })

              .get('.message:contains("Soapee was not able to find this Email Address")').should('exist');
          });
      });

      it('Should show error message for social emails', () => {
        cy
          .visit('/auth/forgot')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type('facebook@email.com')
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendResetEmailPassword', { skipErrors: true })

              .get('.message:contains("This is email assigned to Facebook")').should('exist');
          });
      });

      it('Should show error message for bad code', () => {
        cy
          .visit('/auth/forgot')

          .get('[data-cy=step-1-form]')
          .within(() => {
            cy
              .get('input[name=email]').type('forgot@email.com')
              .get('button[data-cy=send-email]').click()
              .waitForQuery('sendResetEmailPassword')
              .get('.message:contains("Password Reset Email sent")').should('exist');
          })

          .get('[data-cy=step-2-form]')
          .within(() => {
            cy
              .get('input[name=code]').type('code-code')
              .get('button[data-cy=verify-code]').click()
              .waitForQuery('verifyPasswordResetCode')
              .get('.message:contains("Reset Code could not be verified.")').should('exist');
          });
      });
    });
  });
});
