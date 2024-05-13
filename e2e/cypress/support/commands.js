/*global document:true*/
import 'cypress-file-upload';
import cookies from 'js-cookie';

Cypress.Commands.add('waitForQuery', { prevSubject: 'optional' }, (subject, operationName, options) => {
  return cy.wait('@graphqlRequest', options).then(({ request, response }) => {
    if (request.body.operationName !== operationName) {
      cy.log(`Waiting for ${operationName} but detected ${request.body.operationName} - waiting`);
      return cy.waitForQuery(operationName, { ...options, log: false });
    } else {
      const skipErrors = Cypress._.get(options, 'skipErrors') === true;

      const hasError = (response.statusCode !== 200) || !(Cypress._.chain(response).get('body.errors').isEmpty().value());

      cy.log(`Found ${operationName}`);

      if (hasError && !(skipErrors)) {
        return Cypress.Promise
          .reject(Cypress._.get(response, 'body.errors'));
      } else {
        // cypress 6.x seems to return fairly quickly here, often cancelling any other requests
        // in flight when a waitForQuery is followed with a .visit command, for example.
        // Always add a 50ms pause to allow the react state to settle after .waitForQuery to reduce flakiness

        // if this continues to be flaky then it is worth investigating the solution detailed here:
        // https://github.com/cypress-io/cypress/issues/3083#issuecomment-741782566

        return cy.pauseForUI().wrap({ request, response }, { log: false });
      }
    }
  });
});

Cypress.Commands.add('pauseForUI', () => {
  cy.wait(50, { log: false });
});

Cypress.Commands.add('loginUser1', () => {
  return apiLogin('nazar');
});

Cypress.Commands.add('loginUser1ShortToken', () => {
  return apiLogin('nazar', 10);
});

Cypress.Commands.add('loginUser2', () => {
  return apiLogin('aziz');
});

Cypress.Commands.add('loginUser3', () => {
  return apiLogin('stranger');
});

Cypress.Commands.add('loginUser5', () => {
  return apiLogin('forgot');
});

Cypress.Commands.add('resetDb', () => {
  cy.task('resetDb');
});

Cypress.Commands.add('clearDb', () => {
  cy.exec('yarn db:reset');
});

Cypress.Commands.add('loadSeeds', () => {
  cy.exec('yarn db:seed');
});

Cypress.Commands.add('visitIncognito', (url) => {
  cy.clearCookie('soapee-token')
    .clearLocalStorage()
    .visit(url)
    .reload();
});

Cypress.Commands.add('triggerHover', { prevSubject: true }, (elements) => {
  elements.each((index, element) => {
    fireEvent(element, 'mouseover');
  });
});

Cypress.Commands.add('focusType', { prevSubject: true }, (elements, input) => {
  if (Array.isArray(elements)) {
    elements.each((index, element) => {
      focusType(element);
    });
  } else {
    focusType(elements);
  }
  /////////
  function focusType(element) {
    cy.wrap(element)
      .focus()
      .type(input);
  }
});

Cypress.Commands.add('triggerChange', { prevSubject: true }, (elements) => {
  elements.each((index, element) => {
    fireEvent(element, 'change');
  });
});

Cypress.Commands.add('clearType', { prevSubject: true }, (elements, text) => {
  elements.each((index, element) => {
    cy.wrap(element)
      .focus()
      .clear({ force: true })
      .then(($element) => {
        const wrap = cy.wrap($element);

        if (text) {
          wrap.type(text, { force: true });
        }

        return wrap;
      });
  });
});

Cypress.Commands.add('clearTypeAndBlur', { prevSubject: true }, (elements, text) => {
  elements.each((idx, element) => {
    cy.wrap(element)
      .clearType(text)
      .blur();
  });
});

Cypress.Commands.add('pushHistory', (url) => {
  cy.window().then(win => win.hist.push(url));
});


Cypress.Commands.add('getTinyMce', (tinyMceId) => {
  cy.window().then((win) => {
    return win.tinymce.editors[tinyMceId];
  });
});

Cypress.Commands.add('setContent', { prevSubject: true }, (subject, content) => {
  subject.setContent(content);
  return subject;
});

Cypress.Commands.add('setTinyMceContent', (tinyMceId, content) => {
  cy.window().then((win) => {
    cy
      .wrap(win)
      .its('tinymce.editors').should('to.have.any.keys', tinyMceId)
      .wrap(win.tinymce.editors[tinyMceId])
      .its('initialized').should('equal', true)
      .wrap(win.tinymce.editors[tinyMceId])
      .invoke('setContent', content);
  });
});

Cypress.Commands.add('getTinyMceContent', (tinyMceId) => {
  cy.window().then((win) => {
    cy
      .wrap(win)
      .its('tinymce.editors').should('to.have.any.keys', tinyMceId)
      .wrap(win.tinymce.editors[tinyMceId])
      .its('initialized').should('equal', true)
      .wrap(win.tinymce.editors[tinyMceId])
      .invoke('getContent');
  });
});

Cypress.Commands.add('resetEmails', () => {
  return cy
    .request({
      method: 'DELETE',
      url: 'http://localhost:8025/api/v1/messages',
      headers: {
        'content-type': 'application/json'
      },
      json: true
    });
});

Cypress.Commands.add('getLastEmail', email => {
  function requestEmail() {
    return cy
      .request({
        method: 'GET',
        url: 'http://localhost:8025/api/v2/search',
        headers: {
          'content-type': 'application/json'
        },
        qs: {
          kind: 'to',
          query: decodeURIComponent(email)
        },
        json: true
      })
      .then(({ body }) => {
        if (body) {
          return Cypress._.last(body.items);
        } else {

          // If body is null, it means that no email was fetched for this address.
          // We call requestEmail recursively until an email is fetched.
          // We also wait for 300ms between each call to avoid spamming our server with requests
          cy.wait(300);

          return requestEmail();
        }
      });
  }

  return requestEmail();
});

///////////// helpers
////

function apiLogin(username, expiresIn = 600000) {
  return cy
    .clearLocalStorage()
    .clearCookies()
    .task('apiLogin', { username, expiresIn })
    .then((res) => cookies.set('soapee-token', res));
}

function fireEvent(element, event) {
  if (element.fireEvent) {
    element.fireEvent(`on${event}`);
  } else {
    const evObj = document.createEvent('Events');

    evObj.initEvent(event, true, false);

    element.dispatchEvent(evObj);
  }
}
