import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Form, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useSafeState } from 'ahooks';
import * as yup from 'yup';

import client from 'client';
import noop from 'services/noop';
import { setAuthenticated } from 'services/auth';
import { setToken } from 'services/token';
import { errorHasExceptionCode } from 'services/apollo';

import { useForm, Input, ErrorMessage } from 'components/shared/Form';
import GAEventReporter from 'components/shared/GAEventReporter';

import localUserLoginMutation from './queries/localUserLogin.gql';

export default function FormLogin({ rememberMe, onLogin = noop }) {
  const { register, submitForm, submitting, valid, formState } = useForm({
    validation: validationSchema,
    onSubmit: handleSubmit
  });

  const [badUsername, setBadUsername] = useSafeState();
  const [badPassword, setBadPassword] = useSafeState();
  const [userDeleted, setUserDeleted] = useSafeState();

  useErrorMessageClearOnInput();

  return (
    <Form onSubmit={submitForm}>
      <Form.Field>
        <Input
          required
          name="username"
          placeholder="Enter your username"
          register={register}
        />
        <ErrorMessage first name="username" register={register} />

        {badUsername && (
          <Message negative>
            Username {formState.username} was not found.
          </Message>
        )}

        {userDeleted && (
          <Message negative>
            Username {formState.username} was deleted.{' '}
            Please <Link to="/auth/signup">create a new</Link> Soapee Account.
          </Message>
        )}
      </Form.Field>

      <Form.Field>
        <Input
          required
          name="password"
          type="password"
          placeholder="Enter your password"
          register={register}
        />
        <ErrorMessage first name="password" register={register} />

        {badPassword && (
          <Message negative>
            Wrong password was entered for user {formState.username}.
          </Message>
        )}
      </Form.Field>

      <Container textAlign="center">
        <GAEventReporter
          category="User"
          action="loginLocal"
        >
          <Button
            primary
            disabled={!(valid)}
            loading={submitting}
          >
            Login
          </Button>
        </GAEventReporter>
      </Container>
    </Form>
  );

  //

  function useErrorMessageClearOnInput() {
    useEffect(() => {
      setBadUsername();
      setUserDeleted();
    }, [formState.username]);

    useEffect(() => {
      setBadPassword();
    }, [formState.password]);
  }

  function handleSubmit(values) {
    setBadUsername();
    setBadPassword();

    return client
      .mutate({
        mutation: localUserLoginMutation,
        variables: {
          ...values,
          rememberMe
        }
      })
      .then(({ data: { localUserLogin: { token, user } } }) => {
        setToken(token);
        setAuthenticated();
        onLogin({ user });
      })
      .catch((e) => {
        if (errorHasExceptionCode(e, 'user_not_found')) {
          setBadUsername(true);
        } else if (errorHasExceptionCode(e, 'wrong_password')) {
          setBadPassword(true);
        } else if (errorHasExceptionCode(e, 'user_was_deleted')) {
          setUserDeleted(true);
        }
      });
  }
}

FormLogin.defaultProps = {
  rememberMe: false,
  onLogin: noop
};

FormLogin.propTypes = {
  rememberMe: PropTypes.bool,
  onLogin: PropTypes.func
};

const validationSchema = yup.object({
  username: yup
    .string()
    .min(3)
    .max(30)
    .ensure()
    .matches(/^[a-zA-Z0-9_/-]*$/, {
      excludeEmptyString: true,
      message: 'Username can only include letters, numbers and underscores'
    })
    .required(),
  password: yup.string()
    .min(3)
    .max(30)
    .required()
    .ensure()
});
