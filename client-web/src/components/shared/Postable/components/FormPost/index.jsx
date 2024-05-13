import _ from 'lodash';
import React, { useRef } from 'react';
import Bluebird from 'bluebird';
import PropTypes from 'prop-types';
import { Form, Button } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import { useQuery } from '@apollo/client';
import * as yup from 'yup';

import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import { useForm, Input, RichEdit, ErrorMessage, Dropdown } from 'components/shared/Form';

import forumTagsQuery from './forumTags.gql';


export default function FormPost({ post, tagsForForumId, useLabels, onSave, onCancel }) {
  const editor = useRef();

  const postFormValues = usePostFormValues(post);

  const { register, submitForm, submitting, valid, resetForm, setFormValues } = useForm({
    initialValues: postFormValues,
    validation: tagsForForumId ? forumPostValidationSchema : validationSchema,
    onSubmit: handleSubmit
  });

  const forumTagOptions = useForumTagOptions({ forumId: tagsForForumId, skip: !(tagsForForumId) });

  return (
    <div className="form-post" data-cy="form-post">
      <Form onSubmit={submitForm}>
        <Form.Field>
          {useLabels && (
            <label>Post title</label>
          )}

          <Input
            required
            placeholder="Title"
            name="title"
            register={register}
            data-cy="post-title"
          />
          <ErrorMessage name="title" register={register} />
        </Form.Field>

        {!(_.isEmpty(forumTagOptions)) && (
          <Form.Field>
            {useLabels && (
              <label>Post tags</label>
            )}

            <Dropdown
              multiple
              selection
              name="forumTags"
              placeholder="Select post tags..."
              options={forumTagOptions}
              renderLabel={renderLabel}
              register={register}
              data-cy="select-forum-tags"
            />
          </Form.Field>
        )}

        <Form.Field>
          {useLabels && (
            <label>Post content</label>
          )}

          <PostImageLinkMessage visible />
          <RichEdit
            id={post ? `post-${post.id}` : 'new-content'}
            name="content"
            placeholder="Add your comments..."
            register={register}
            ref={editor}
          />
          <ErrorMessage first name="content" register={register} />
        </Form.Field>

        <Button primary loading={submitting} disabled={!(valid)}>Save Post</Button>
        {onCancel && <Button secondary disabled={!(valid) || submitting} onClick={onCancel}>Cancel</Button>}
      </Form>
    </div>
  );

  // private

  function handleSubmit(values) {
    return Bluebird
      .resolve(onSave(values))
      .then(() => {
        resetForm();
        setFormValues({ forumTags: [] });
        editor.current?.clear();
      });
  }
}

FormPost.defaultProps = {
  post: null,
  tagsForForumId: null,
  useLabels: false,
  onCancel: null
};

FormPost.propTypes = {
  post: PropTypes.object,
  tagsForForumId: PropTypes.string,
  useLabels: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func.isRequired
};

function usePostFormValues(post) {
  return useCreation(() => {
    if (post) {
      return {
        ...post,
        forumTags: _.map(post?.forumTaggables, 'forumTag.id')
      };
    }
  }, [post]);
}

function useForumTagOptions({ forumId, skip }) {
  const { data: { forumTags } = {} } = useQuery(forumTagsQuery, {
    variables: { search: { forumId: forumId } },
    skip
  });

  return useCreation(() => _.map(forumTags, (tag) => ({
    key: tag.id,
    value: tag.id,
    label: {
      content: tag.tag,
      color: tag.color
    }
  })), [forumTags]);
}

function renderLabel({ label }) {
  return label;
}

const baseSchema = {
  title: yup.string()
    .min(3)
    .max(200)
    .required()
    .ensure(),
  content: yup.string()
    .min(3)
    .required()
    .ensure()
};

const validationSchema = yup.object(baseSchema);

const forumPostValidationSchema = yup.object({
  ...baseSchema,
  forumTags: yup.array().of(yup.string()).nullable()
});
