import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import Bluebird from 'bluebird';
import { Header, Message, Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import client from 'client';

import { ErrorMessage, Input, useForm } from 'components/shared/Form';
import { errorHasExceptionCode, errorHasExceptionCodeWithKeyData } from 'services/apollo';

import sendResetPasswordEmailMutation from './sendResetPasswordEmail.gql';
import verifyPasswordResetCodeMutation from './verifyPasswordResetCode.gql';
import updatePasswordWithVerificationTokenMutation from './updatePasswordWithVerificationToken.gql';


export default function Forgot() {
  const [token, setToken] = useState();
  const [step1Passed, setStep1Passed] = useState();
  const [step2Passed, setStep2Passed] = useState();

  return (
    <div>
      <Header as="h2">
        Soapee Password Reset
      </Header>

      <Message>
        <p>
          Soapee password reset is only available if you've created a Soapee account using
          a username and password and supplied an email address.
        </p>
      </Message>

      <Message>
        <Message.Header>Step 1 - Send Reset Email</Message.Header>
        <p>Enter the email address used when you registered with username and password.</p>

        <Step1Form onResult={handleStep1} />
      </Message>

      {step1Passed && (
        <Message>
          <Message.Header>Step 2 - Enter Reset Code</Message.Header>
          <p><strong>An email has been sent containing your reset code. Enter the reset code to proceed.</strong></p>
          <p>Please check your spam folder just in case the reset email ended up there.</p>

          <Step2Form token={token} onResult={handleStep2} />
        </Message>
      )}

      {step2Passed && (
        <Message>
          <Message.Header>Step 3 - Reset Password</Message.Header>
          <p>Reset Code confirmed!</p>
          <p>Please enter your new password.</p>

          <Step3Form token={token} />
        </Message>
      )}
    </div>
  );

  //

  function handleStep1({ token: resultToken }) {
    setToken(resultToken);
    setStep1Passed(true);
  }

  function handleStep2(result) {
    setStep2Passed(result);
  }
}

function Step1Form({ onResult }) {
  const [found, setFound] = useState();
  const [socialProviders, setSocialProviders] = useState();

  const { register, submitForm, submitting, valid, formState } = useForm({
    validation: step1Schema,
    onSubmit: handleSubmit
  });

  useEffect(() => {
    setFound();
    setSocialProviders();
  }, [formState?.email]);

  return (
    <Form onSubmit={submitForm} data-cy="step-1-form">
      <Form.Field>
        <label>Soapee Account Email Address</label>
        <Input
          required
          name="email"
          type="email"
          placeholder="Email address"
          register={register}
        />
        <ErrorMessage first name="email" register={register} />
      </Form.Field>

      <Button primary loading={submitting} disabled={!(valid)} data-cy="send-email">
        Send Password Reset Email
      </Button>

      {found && (
        <Message
          positive
          header="Confirmation"
          content="Password Reset Email sent"
        />
      )}

      {(found === false) && !(_.isArray(socialProviders)) && (
        <Message
          negative
          content="Soapee was not able to find this Email Address"
        />
      )}

      {(found === false) && _.isArray(socialProviders) && (
        <Message
          negative
        >
          This is email assigned to {_.chain(socialProviders).map(_.capitalize).join(' and ').value()}.
          <br />
          Please <Link to="/auth/login">Login</Link> using the Social Login buttons instead.
        </Message>
      )}
    </Form>
  );

  function handleSubmit(values) {
    const { email } = values;

    return Bluebird.resolve(
      client.mutate({
        mutation: sendResetPasswordEmailMutation,
        variables: {
          input: { email }
        }
      })
    )
      .then(({ data: { sendResetEmailPassword: { token } } }) => {
        setFound(true);

        return onResult({
          token
        });
      })
      .catch((e) => {
        if (errorHasExceptionCode(e, 'email_not_found')) {
          setFound(false);
        } else if (errorHasExceptionCode(e, 'social_login')) {
          const providers = errorHasExceptionCodeWithKeyData(e, 'social_login', 'providers');

          setFound(false);
          setSocialProviders(providers);
        }
      });
  }
}

Step1Form.propTypes = {
  onResult: PropTypes.func.isRequired
};

function Step2Form({ token, onResult }) {
  const [found, setFound] = useState();
  const { register, submitForm, submitting, valid } = useForm({
    validation: step2Schema,
    onSubmit: handleSubmit
  });

  return (
    <Form onSubmit={submitForm} data-cy="step-2-form">
      <Form.Field>
        <label>Reset Code</label>
        <Input
          required
          name="code"
          placeholder="Enter Reset Code"
          register={register}
        />
        <ErrorMessage first name="code"  register={register} />
      </Form.Field>

      <Button primary loading={submitting} disabled={!(valid)} data-cy="verify-code">
        Verify Reset Code
      </Button>

      {(found === false) && (
        <Message
          negative
          content="Reset Code could not be verified. Please check that it is input correctly."
        />
      )}
    </Form>
  );

  function handleSubmit(values) {
    const { code } = values;

    return Bluebird.resolve(
      client.mutate({
        mutation: verifyPasswordResetCodeMutation,
        variables: {
          input: { code, token }
        }
      })
    )
      .then(({ data: { verifyPasswordResetCode } }) => {
        setFound(verifyPasswordResetCode);

        return onResult(verifyPasswordResetCode);
      });
  }
}

Step2Form.propTypes = {
  token: PropTypes.string.isRequired,
  onResult: PropTypes.func.isRequired
};

function Step3Form({ token }) {
  const [username, setUsername] = useState();
  const { register, submitForm, submitting, valid } = useForm({
    validation: step3Schema,
    onSubmit: handleSubmit
  });

  return (
    <Form onSubmit={submitForm} data-cy="step-3-form">
      <Form.Field>
        <label>New Password</label>
        <Input
          required
          placeholder="New Password"
          name="newPassword"
          type="password"
          register={register}
        />
        <ErrorMessage first name="newPassword" register={register} />
      </Form.Field>

      <Form.Field>
        <label>Confirm New Password</label>
        <Input
          required
          placeholder="Confirm New Password"
          name="confirmPassword"
          type="password"
          register={register}
        />
        <ErrorMessage first name="confirmPassword" register={register} />
      </Form.Field>

      <Button primary loading={submitting} disabled={!(valid)} data-cy="update-password">Update Password</Button>

      {(username) && (
        <Message
          positive
          header="Password has been reset"
          content={(
            <span>
              Password for user name <strong>{username}</strong> has been reset.
              Please use your new password in the <Link to="/auth/login">Login</Link> page.
            </span>
          )}
        />
      )}
    </Form>
  );

  function handleSubmit(values) {
    const { newPassword, confirmPassword } = values;

    return Bluebird.resolve(
      client.mutate({
        mutation: updatePasswordWithVerificationTokenMutation,
        variables: {
          input: { token, newPassword, confirmPassword }
        }
      })
    )
      .then(({ data: { updatePasswordWithVerificationToken } }) => {
        setUsername(updatePasswordWithVerificationToken);
      });
  }
}

Step3Form.propTypes = {
  token: PropTypes.string.isRequired
};

const step1Schema = yup.object({
  email: yup
    .string()
    .email()
    .max(100)
    .required()
});

const step2Schema = yup.object({
  code: yup
    .string()
    .required()
});

const step3Schema = yup.object({
  newPassword: yup.string().min(3).max(30).required()
    .default('')
    .label('New password'),
  confirmPassword: yup.string().min(3).max(30).required()
    .test('match',
      'passwords do not match',
      function(value) {
        return value === this.parent.newPassword;
      }
    )
    .default('')
    .label('Confirm password')
});
