import React from 'react';
import { Header, Menu } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';
import { useHistory, useParams } from 'react-router-dom';

import client from 'client';
import Section from 'components/shared/Section';

import AdditiveForm from '../components/AdditiveForm';

import AdditiveRecipes from './components/AdditiveRecipes';

import deleteMyAdditiveMutation from './queries/deleteMyAdditive.gql';
import getMyAdditiveQuery from './queries/getMyAdditive.gql';
import updateMyAdditiveMutation from './queries/updateMyAdditive.gql';

export default function AdditiveView() {
  const { push } = useHistory();
  const { additiveId } = useParams();
  const { loading, data: { additive } = {} } = useQuery(getMyAdditiveQuery, {
    variables: { id: additiveId }
  });

  return (
    <Section id="root-additive-view" loading={loading}>
      <Header as="h2">Edit Additive</Header>

      {additive && (
        <AdditiveForm
          additive={additive}
          onCancel={redirectToAdditives}
          onSave={handleUpdateAdditive}
          onDelete={handleDeleteAdditive}
        />
      )}

      {additive && (
        <>
          <Menu stackable>
            <Menu.Item active name="Additive Recipes" />
          </Menu>

          <AdditiveRecipes additive={additive} />
        </>
      )}
    </Section>
  );

  //

  function handleUpdateAdditive(input) {
    return client
      .mutate({
        mutation: updateMyAdditiveMutation,
        variables: { id: additiveId, input }
      })
      .then(redirectToAdditives);
  }

  function handleDeleteAdditive() {
    return client
      .mutate({
        mutation: deleteMyAdditiveMutation,
        variables: { id: additiveId }
      })
      .then(redirectToAdditives);
  }

  function redirectToAdditives() {
    push('/settings/additives');
  }
}
