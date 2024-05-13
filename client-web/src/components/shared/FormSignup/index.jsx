import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Form, Label, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import client from 'client';

import noop from 'services/noop';
import { setAuthenticated } from 'services/auth';
import { setToken } from 'services/token';
import { errorHasExceptionCode, errorHasExceptionCodeWithKeyData } from 'services/apollo';

import { useForm, Input, ErrorMessage } from 'components/shared/Form';
import GAEventReporter from 'components/shared/GAEventReporter';

import localSignupMutation from './localSignup.gql';


export default function FormSignup({ onLogin }) {
  const { register, submitForm, submitting, valid, formState } = useForm({
    validation: validationSchema,
    onSubmit: handleSubmit
  });

  const [usernameTaken, setUsernameTaken] = useState();
  const [emailTaken, setEmailTaken] = useState();

  useErrorMessageClearOnInput();

  return (
    <Form onSubmit={submitForm}>
      <Form.Field>
        <Form.Field
          required
          name="username"
          placeholder="Enter your username"
          control={Input}
          register={register}
        />
        <ErrorMessage first name="username" register={register} />

        {usernameTaken && (
          <Message negative>
            Username {formState.username} is taken. Please try a different username.
          </Message>
        )}
      </Form.Field>

      <Form.Field>
        <Form.Field
          required
          name="password"
          type="password"
          placeholder="Enter your password"
          control={Input}
          register={register}
        />
        <ErrorMessage first name="password" register={register} />
      </Form.Field>

      <Form.Field>
        <Form.Field
          name="email"
          placeholder="Email (optional)"
          control={Input}
          register={register}
        />
        <Label pointing>Your Email is used only to reset passwords.</Label>
        <ErrorMessage first name="email" register={register} />

        {_.isBoolean(emailTaken) && (
          <Message negative>
            Email {formState.email} is taken.
            Please <Link to="/auth/login">login instead</Link> or {' '}
            <Link to="/auth/forgot">Reset</Link> your password.
          </Message>
        )}

        {_.isArray(emailTaken) && (
          <Message negative>
            Email {formState.email} is assigned to a{' '}
            {_.chain(emailTaken).map(_.capitalize).join(' and ').value()} login.
            <br />
            Please use the Social Sign in button instead.
            <Link to="/auth/forgot">Reset</Link> your password.
          </Message>
        )}
      </Form.Field>

      <Container textAlign="center">
        <GAEventReporter
          category="User"
          action="signupLocal"
        >
          <Button primary disabled={!(valid)} loading={submitting}>Signup</Button>
        </GAEventReporter>
      </Container>
    </Form>
  );

  //

  function useErrorMessageClearOnInput() {
    useEffect(() => {
      setUsernameTaken();
    }, [formState.username]);

    useEffect(() => {
      setEmailTaken();
    }, [formState.email]);
  }

  function handleSubmit(values) {
    setUsernameTaken();
    setEmailTaken();

    return client
      .mutate({
        mutation: localSignupMutation,
        variables: values
      })
      .then(({ data: { localSignup: { token, user } } }) => {
        setToken(token);
        setAuthenticated();
        onLogin({ user });
      })
      .catch((e) => {
        if (errorHasExceptionCode(e, 'username_taken')) {
          setUsernameTaken(true);
        }

        if (errorHasExceptionCode(e, 'email_taken')) {
          const providers = errorHasExceptionCodeWithKeyData(e, 'email_taken', 'providers');

          if (!(_.isEmpty(providers))) {
            setEmailTaken(providers);
          } else {
            setEmailTaken(true);
          }
        }
      });
  }
}

FormSignup.defaultProps = {
  onLogin: noop
};

FormSignup.propTypes = {
  onLogin: PropTypes.func
};

const validationSchema = yup.object({
  email: yup.string()
    .email()
    .nullable()
    .ensure(),
  password: yup.string()
    .min(3)
    .max(30)
    .required()
    .ensure(),
  username: yup
    .string()
    .min(3)
    .max(30)
    .ensure()
    .matches(/^[a-zA-Z0-9_/-]*$/, {
      excludeEmptyString: true,
      message: 'Username can only include letters, numbers and underscores'
    })
    .required()
});
