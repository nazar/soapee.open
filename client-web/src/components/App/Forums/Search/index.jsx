import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Form, Message, Segment, Transition } from 'semantic-ui-react';
import * as yup from 'yup';

import useCurrentUser from 'hooks/useCurrentUser';
import usePaginator from 'hooks/usePaginator';

import Group from 'components/shared/Group';
import UberPaginator from 'components/shared/UberPaginator';
import SortOptionsBar, { newestFirstOrder } from 'components/shared/SortOptionsBar';
import { PostsSummary } from 'components/shared/Postable';

import { ErrorMessage, Input, useForm } from 'components/shared/Form';

import Breadcrumb from '../components/BreadCrumb';

import searchPostsQuery from './queries/searchPosts.gql';
import searchPostsSummaryQuery from './queries/searchPostsSummary.gql';

import './style.styl';

export default function SearchForums() {
  const [order, setOrder] = useState(newestFirstOrder);
  const [searchTerm, setSearchTerm] = useState();
  const currentUser = useCurrentUser();

  const search = {
    searchTerm,
    postableType: 'forums'
  };

  const summaryQuery = {
    query: searchPostsSummaryQuery,
    dataKey: 'postsSummary',
    variables: {
      search
    }
  };

  const itemsQuery = {
    query: searchPostsQuery,
    dataKey: 'posts',
    variables: {
      search,
      order
    }
  };

  const { paginatorProps, items: posts, loading } = usePaginator({
    summaryQuery,
    itemsQuery,
    skip: _.isEmpty(searchTerm)
  });

  const noPostsFound = !(loading) && _.isEmpty(posts);

  return (
    <div id="root-forums-search">
      <Container>
        <Breadcrumb activeSection="Search" data-cy="bread" />

        <Message
          icon="search"
          header="Search Forum Posts"
          data-cy="search-forums-posts"
          content="Search all Forum Posts"
        />

        <SortOptionsBar
          order={order}
          visible={posts?.length > 0}
          entityName="Posts"
          onChange={setOrder}
        />

        <ForumSearchForm
          onSearch={setSearchTerm}
        />

        {!(_.isEmpty(posts)) && (
          <Transition.Group>
            {_.map(posts, post => (
              <Segment key={`post-${post.id}`}>
                <PostsSummary
                  showContext
                  post={post}
                  canAdmin={currentUser?.isAdmin}
                  canEdit={currentUser?.id === post.userId}
                />
              </Segment>
            ))}
          </Transition.Group>
        )}

        {noPostsFound && <NoPostsFound />}

        <UberPaginator {...paginatorProps} />
      </Container>
    </div>
  );
}

function ForumSearchForm({ onSearch }) {
  const { register, submitForm, submitting, valid } = useForm({
    validation: searchSchema,
    onSubmit: handleSubmit
  });

  return (
    <Segment data-cy="forum-search-form">
      <Form onSubmit={submitForm} >
        <Form.Field>
          <Group className="search-content">
            <div className="search">
              <Input
                required
                placeholder="Search for Forum Posts by content"
                name="searchTerm"
                register={register}
                data-cy="post-search-term"
              />
              <ErrorMessage name="title" register={register} />
            </div>

            <div className="action">
              <Button primary type="submit" disabled={!(valid) || submitting} data-cy="button-search">
                Search
              </Button>
            </div>
          </Group>
        </Form.Field>
      </Form>
    </Segment>
  );

  function handleSubmit({ searchTerm }) {
    onSearch(searchTerm);
  }
}

ForumSearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired
};

function NoPostsFound() {
  return (
    <Message icon>
      <Message.Content>
        <Message.Header>No Forums Posts found</Message.Header>
        <p>No Forum Posts found using yrou search term. Please try another search term or broaden your search.</p>
      </Message.Content>
    </Message>
  );
}


const searchSchema = yup.object({
  searchTerm: yup.string().required().ensure().min(3).label('Search Term')
});
