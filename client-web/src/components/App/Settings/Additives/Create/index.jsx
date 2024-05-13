import React from 'react';
import { Header } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import client from 'client';

import Section from 'components/shared/Section';

import AdditiveForm from '../components/AdditiveForm';

import createAdditiveMutation from './queries/createAdditive.gql';

export default function CreateAdditive() {
  const { push } = useHistory();

  return (
    <Section id="root-create-additive">
      <Header as="h2">Add Additive</Header>
      <AdditiveForm onCancel={redirectToAdditives} onSave={handleAddAdditive} />

    </Section>
  );

  //

  function handleAddAdditive(input) {
    return client
      .mutate({
        mutation: createAdditiveMutation,
        variables: { input }
      })
      .then(redirectToAdditives);
  }

  function redirectToAdditives() {
    push('/settings/additives');
  }
}
