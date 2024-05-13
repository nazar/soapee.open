import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button, Form, Label, Icon, Popup, Message } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import * as yup from 'yup';
import debounce from 'debounce-promise';

import client from 'client';
import { errorExceptionCodeValue } from 'services/apollo';
import LoginSignup from 'components/shared/Modals/LoginSignup';
import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import { useForm, Input, Radio, RichEdit, TextArea, ErrorMessage } from 'components/shared/Form';

import forumExistsQuery from '../queries/forumExists.gql';

import ForumTags from './ForumTags';


export default function FormForum({ forum, onSave, onCancel, saveCaption }) {
  const editing = !(_.isEmpty(forum));
  const validationSchema = editing ? validationEditSchema : validationCreateSchema;

  const forumValues = useForumToForm(forum);
  const [tagDeleteError, setTagDeleteError] = useState();

  const { register, submitForm, submitting, valid, formState, setFormValues } = useForm({
    initialValues: forumValues,
    validation: validationSchema,
    onSubmit: handleSubmit
  });

  return (
    <Form onSubmit={submitForm}>
      {!(editing) && (
        <Form.Field>
          <Input placeholder="Name" name="name" disabled={editing} register={register} />
          <ErrorMessage padded name="name" register={register} />
          <div>
            <Label>Forum names are unique and cannot be edited once created</Label>
            <Popup
              trigger={<Icon link name="question circle" />}
            >
              Forum names must be between 3 and 20 characters, cannot contain spaces and
              cannot start and end with an underscore.
            </Popup>
          </div>
        </Form.Field>
      )}

      <Form.Field>
        <label>Forum summary</label>
        <TextArea
          required
          placeholder="Enter Forum Summary"
          name="summary"
          register={register}
          data-cy="forum-summary"
        />
        <ErrorMessage padded name="summary" register={register} />
        <div>
          <Label>A Forum summary is a short description shown when browsing forums</Label>
          <Popup
            trigger={<Icon link name="question circle" />}
          >
            Forum summaries must be between 3 and 200 characters
          </Popup>
        </div>
      </Form.Field>

      <Form.Field>
        <label>Forum Banner message</label>
        <PostImageLinkMessage visible />
        <RichEdit
          required
          id="forum-banner"
          placeholder="Enter Forum Banner"
          name="banner"
          register={register}
        />
        <ErrorMessage padded name="banner" register={register} />
        <div>
          <Label>A Forum Banner is shown at the top of the your Forum landing page</Label>
          <Popup
            trigger={<Icon link name="question circle" />}
          >
            Use the banner to describe in detail the purpose of your forum and to set forum rules and goals.
          </Popup>
        </div>
      </Form.Field>

      <Form.Field>
        <label>Forum Tags</label>
      </Form.Field>

      <ForumTags
        formState={formState}
        register={register}
        onAddTag={handleAddTag}
        onDeleteTag={handleDeleteTag}
      />
      <ErrorMessage always name="forumTags" register={register} />

      {tagDeleteError && (
        <Message
          negative
          content="Could not delete tags as one or more tag is in use"
        />
      )}

      <Form.Field>
        <label>Forum type</label>
      </Form.Field>

      <Form.Field>
        <Radio
          label="Public - anyone can view and post in your forum"
          name="forumType"
          value="public"
          register={register}
        />
      </Form.Field>

      <Form.Field>
        <Radio
          label="Restricted - anyone can view but posting is restricted to moderators"
          name="forumType"
          value="restricted"
          register={register}
        />
      </Form.Field>

      <LoginSignup>
        <Button
          primary
          type="submit"
          disabled={submitting || !(valid)}
          loading={submitting}
        >
          {saveCaption}
        </Button>
      </LoginSignup>

      <Button type="button" onClick={onCancel} disabled={submitting}>Cancel</Button>
    </Form>
  );

  //

  function handleSubmit(values) {
    setTagDeleteError();

    return Bluebird
      .resolve(onSave(values))
      .catch((e) => {
        if (errorExceptionCodeValue(e, 'tag_in_use')) {
          setTagDeleteError(true);
        }
      });
  }

  function handleAddTag(tagName) {
    setFormValues((prev) => ({
      forumTags: [
        ...(prev.forumTags || []),
        {
          tag: tagName,
          color: 'black'
        }
      ]
    }));
  }

  function handleDeleteTag(tag) {
    setFormValues((prev) => ({
      forumTags: _.without(prev.forumTags, tag)
    }));
  }
}

FormForum.defaultProps = {
  forum: null
};

FormForum.propTypes = {
  forum: PropTypes.object,
  saveCaption: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

function useForumToForm(forum) {
  return useCreation(() => {
    if (forum) {
      return {
        ...forum,
        forumTags: _.orderBy(forum.forumTags, ({ tag }) => _.toLower(tag))
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const nameValidator = yup.string()
  .min(3)
  .max(20)
  .test(
    'no_lower_start_end',
    'cannot start or end with underscore',
    value => _.isNull(value.match(/^_|_$/))
  )
  .test(
    'valid_chars',
    '${value} is not a valid forum name.', // eslint-disable-line
    value => !(_.isNull(value.match(/^[A-Za-z_]+$/)))
  )
  .test(
    'exists',
    '${value} already exists', // eslint-disable-line
    value => debouncedForumNameExists(value)
  )
  .label('Forum Name')
  .default('')
  .required();

const semanticColors = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'grey',
  'black'
];

const baseSchema = {
  summary: yup.string()
    .min(10)
    .max(200)
    .required()
    .label('Forum Summary')
    .default(''),
  banner: yup.string()
    .min(10)
    .required()
    .label('Forum Banner')
    .default(''),
  forumTags: yup.array().of(
    yup.object({
      id: yup.number().nullable(),
      tag: yup.string().required().max(50).label('tag'),
      color: yup.string().oneOf(semanticColors)
    })
  )
    .nullable()
    .test('duplicate-tags', 'Duplicate tag names detected', duplicateForumTags),
  forumType: yup.string()
    .oneOf(['public', 'restricted', 'private'])
    .default('public')
};

const validationEditSchema = yup.object(baseSchema);

const validationCreateSchema = yup.object({
  ...baseSchema,
  name: nameValidator
});

function forumNameExists(name) {
  if ((name || '').length > 2) {
    return client
      .query({
        query: forumExistsQuery,
        variables: { name }
      })
      .then(({ data }) => data.forumExists !== true);
  } else {
    return true;
  }
}

function duplicateForumTags(forumTags) {
  if (_.isEmpty(forumTags)) {
    return true;
  } else {
    return _.chain(forumTags).groupBy(({ tag }) => _.toLower(tag)).values().some(tagValues => tagValues.length > 1).thru(res => !(res)).value();
  }
}

const debouncedForumNameExists = debounce(forumNameExists, 250);
