import React from 'react';
import { Container, Segment, Header } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import client from 'client';

import Breadcrumb from './components/BreadCrumb';
import ForumForm from './components/FormForum';

import createForumMutation from './queries/createForum.gql';

export default function Create() {
  const { push } = useHistory();

  return (
    <Container className="create-forum view-page">
      <Bread />

      <Segment>
        <Header>Create a new Forum</Header>
        <ForumForm saveCaption="Create Forum" onSave={handleSave} onCancel={handleCancel} />
      </Segment>
    </Container>
  );

  //

  function handleSave(forum) {
    return client.mutate({
      mutation: createForumMutation,
      variables: { input: forum }
    })
      .then(({ data: { createForum } }) => push(`/forums/${createForum.id}`));
  }

  function handleCancel() {
    push('/forums');
  }
}

function Bread() {
  return (
    <Segment>
      <Breadcrumb activeSection="Create a new Forum" />
    </Segment>
  );
}
