import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button, Form, Message, Popup } from 'semantic-ui-react';
import * as yup from 'yup';

import { castStrip } from 'services/yup';
import { errorHasExceptionCode } from 'services/apollo';

import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import { ErrorMessage, Input, RichEdit, useForm } from 'components/shared/Form';
import noop from 'services/noop';
import Group from 'components/shared/Group';

import './style.styl';

export default function AdditiveForm({ additive, onSave, onCancel, onDelete }) {
  const { register, formState, submitForm, submitting, valid } = useForm({
    initialValues: additive,
    validation: validationSchema,
    onSubmit: handleSubmit
  });

  const [nameExists, setNameExists] = useState();

  return (
    <Form className="my-additive-form-component" error={!!(nameExists)} data-cy="my-additive-form" onSubmit={submitForm}>
      <Form.Field required error={!!(nameExists)}>
        <label>Additive name</label>
        <Input autoFocus placeholder="Name" name="name" register={register} />
        <ErrorMessage padded name="name" register={register} />
      </Form.Field>

      {nameExists && (
        <Message
          error
          content={`${formState.name} already exists.`}
          data-cy="error-name-exists"
        />
      )}

      <Form.Field>
        <label>Additive notes</label>
        <PostImageLinkMessage visible />

        <RichEdit
          id="additive-notes"
          placeholder="Type additive notes..."
          name="notes"
          register={register}
        />
      </Form.Field>

      <Group gap="0">
        <Button
          primary
          type="submit"
          disabled={submitting || !(valid)}
          loading={submitting}
        >
          Save
        </Button>

        <Button type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>

        {additive && (
          <DeleteButton canDelete={!(additive.stats?.recipes?.count > 0)} onDelete={onDelete} />
        )}
      </Group>
    </Form>
  );

  //

  function handleSubmit(values) {
    const payload = castStrip(validationSchema, values);

    setNameExists();

    return Bluebird
      .resolve(onSave(payload))
      .catch((e) => {
        if (errorHasExceptionCode(e, 'additive_exists')) {
          setNameExists(true);
        }
      });
  }
}

AdditiveForm.defaultProps = {
  additive: null,
  onDelete: noop
};

AdditiveForm.propTypes = {
  additive: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func
};

function DeleteButton({ canDelete, onDelete }) {
  return (
    <div className="delete-button">
      <Popup
        disabled={canDelete}
        content="Can't delete additive as it is used on Recipes"
        position='left center'
        trigger={(
          <span>
            <Button negative type="button" disabled={!(canDelete)} data-cy="delete-button" onClick={handleDelete}>
              Delete
            </Button>
          </span>
        )}
      />
    </div>
  );

  function handleDelete() {
    onDelete();
  }
}

DeleteButton.defaultProps = {
  canDelete: false
};

DeleteButton.propTypes = {
  canDelete: PropTypes.bool,
  onDelete: PropTypes.func.isRequired
};

const validationSchema = yup.object({
  name: yup.string()
    .max(200)
    .required()
    .label('Additive name')
    .ensure(),
  notes: yup.string()
    .nullable()
    .label('Additive notes')
    .ensure()
});
