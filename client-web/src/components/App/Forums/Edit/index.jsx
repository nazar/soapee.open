import React from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Container, Segment, Header, Message } from 'semantic-ui-react';

import client from 'client';
import useCurrentUser from 'hooks/useCurrentUser';


import Breadcrumb from '../components/BreadCrumb';
import ForumForm from '../components/FormForum';

import forumQuery from './queries/forum.gql';
import updateForumMutation from './queries/updateForum.gql';

export default function Edit() {
  const { forumId } = useParams();
  const { push } = useHistory();

  const { loading, data: { forum } = {} } = useQuery(forumQuery, {
    variables: { id: forumId }
  });

  const currentUser = useCurrentUser();

  const forumName = forum?.name;
  const canEditForum = (currentUser?.id ?? -1) === (forum?.userId ?? -2);

  return (
    <Container className="edit-forum view-page">
      <Bread forumName={forumName} />

      <Segment loading={loading}>
        {forum && canEditForum && (
          <>
            <Header>Editing {forumName}</Header>

            <ForumForm
              saveCaption="Update Forum"
              forum={forum}
              onSave={handleSave}
              onCancel={redirectToForum}
            />
          </>
        )}

        {forum && !(canEditForum) && (
          <Message negative>
            <Message.Header>Not Authorised</Message.Header>
            <p>Only the Forum owner can edit this Forum.</p>
          </Message>
        )}
      </Segment>
    </Container>
  );

  //

  function handleSave(forumData) {
    return client.mutate({
      mutation: updateForumMutation,
      variables: {
        id: forumId,
        input: forumData
      }
    })
      .then(redirectToForum);
  }

  function redirectToForum() {
    push(`/forums/${forumId}`);
  }
}

function Bread({ forumName }) {
  return (
    <Segment>
      <Breadcrumb activeSection={`Editing ${forumName}`} />
    </Segment>
  );
}

Bread.defaultProps = {
  forumName: null
};

Bread.propTypes = {
  forumName: PropTypes.string
};
