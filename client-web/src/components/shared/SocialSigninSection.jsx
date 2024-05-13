import _ from 'lodash';
import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import noop from 'services/noop';
import { setAuthenticated, socialSigninProvider } from 'services/auth';
import { setToken } from 'services/token';

import GAEventReporter from 'components/shared/GAEventReporter';


export default function SocialSigninSection({ rememberMe, onLoggedIn }) {
  const secure = window?.location?.protocol === 'https:';

  return (
    <div>
      {!(secure) && (
        <Message
          negative
          icon="stop circle"
          header="Not Secure"
          content={(
            <p>Please visit the <a href="https://soapee.com/auth/login">secure login page</a> to login with Google.</p>
          )}
        />
      )}

      <GoogleSignIn onLoggedIn={handleSocialSignup} />
      <div>&nbsp;</div>
      <FacebookSignIn onLoggedIn={handleSocialSignup} />
    </div>
  );

  //

  function handleSocialSignup({ token, provider }) {
    return socialSigninProvider({ token, provider, rememberMe })
      .then(({ data: { verificationUserLoginOrSignup } }) => {
        const soapeeToken = _.get(verificationUserLoginOrSignup, 'token');
        const user = _.get(verificationUserLoginOrSignup, 'user');

        setToken(soapeeToken);
        setAuthenticated();
        onLoggedIn({ user });
      });
  }
}

SocialSigninSection.defaultProps = {
  rememberMe: false,
  onLoggedIn: noop
};

SocialSigninSection.propTypes = {
  rememberMe: PropTypes.bool,
  onLoggedIn: PropTypes.func
};

function GoogleSignIn({ onLoggedIn }) {
  const [state, dispatch] = useReducer(reducer, {
    blocked: false,
    loading: false,
    cancelled: false,
    initialised: false
  });

  useEffect(() => {
    let attempts = 0;

    if (window?.location?.protocol === 'https:') {
      initGApi();
    }

    function initGApi() {
      setTimeout(() => {
        if (!(window.gapi)) {
          attempts += 1;

          if (attempts < 10) {
            initGApi();
          } else {
            dispatch({ type: 'blocked' });
          }
        } else {
          window.gapi.load('auth2', () => dispatch({ type: 'initialised' }));
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <GAEventReporter
        category="User"
        action="loginGoogle"
      >
        <Button
          icon
          primary
          labelPosition="left"
          onClick={handleSignIn}
          loading={state.loading}
          disabled={!(state.initialised)}
        >
          <Icon name="google" />
          Sign In with Google
        </Button>
      </GAEventReporter>

      {state.blocked && (
        <Message
          negative
          icon="stop circle"
          header="Google is Blocked"
          content="Could not connect to the Google SDK. Please check your Ad blocking Settings."
        />
      )}

      {state.cancelled && (
        <Message
          negative
          icon="stop circle"
          header="Not Logged In"
          content="Google did not confirm your login. Please try again."
        />
      )}
    </>
  );

  //

  function handleSignIn() {
    const googleAuth = window.gapi.auth2.init({
      client_id: import.meta.env.VITE_GOOGLE_APP_ID,
      fetch_basic_profile: true
    });

    dispatch({ type: 'loading' });

    return googleAuth
      .then(() => {
        if (googleAuth.isSignedIn.get()) {
          return getGoogleUserAuthResponse();
        } else {
          return googleAuth.signIn()
            .then(getGoogleUserAuthResponse);
        }
      })
      .then(res => res.id_token)
      .then((accessToken) => {
        dispatch({ type: 'loaded' });
        onLoggedIn({ token: accessToken, provider: 'google' });
      });

    //

    function getGoogleUserAuthResponse() {
      return googleAuth.currentUser.get().getAuthResponse();
    }
  }
}

GoogleSignIn.propTypes = {
  onLoggedIn: PropTypes.func.isRequired
};

function FacebookSignIn() {
  return (
    <div>
      <Message
        negative
        icon="stop circle"
        header="Facebook Logins Deprecated"
      />

      <p>
        Due to a recent <Link to="/posts/76">Facebook policy change</Link>, Facebook logins are not longer available on Soapee.
      </p>
      <p>
        Please visit the <Link to="/auth/facebook-recover">Facebook recovery page</Link> to convert you Facebook login to a local login.
      </p>
    </div>
  );
}

FacebookSignIn.propTypes = {
  onLoggedIn: PropTypes.func.isRequired
};

function reducer(state, action) {
  switch (action.type) {
    case 'blocked':
      return {
        ...state,
        blocked: true
      };
    case 'cancelled':
      return {
        ...state,
        cancelled: true,
        loading: false
      };
    case 'loading':
      return {
        ...state,
        loading: true
      };
    case 'loaded':
      return {
        ...state,
        loading: false
      };
    case 'initialised':
      return {
        ...state,
        initialised: true
      };
    default:
      throw new Error(`${action.type} is not recognised`);
  }
}
