import React from 'react';
import { useQuery } from '@apollo/client';
import { Helmet } from 'react-helmet';
import { Container, Breadcrumb, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import OilGrid from 'components/shared/OilGrid';
import Section from 'components/shared/Section';

import oilsQuery from 'queries/oil/oils.gql';

export default function List() {
  const { data: { oils } = {}, loading } = useQuery(oilsQuery);

  return (
    <Container className="view-page">
      <Helmet
        title="Oils - Soapee"
      />

      <Bread />

      <Section basic loading={loading} padded={false}>
        <OilGrid oils={oils} />
      </Section>
    </Container>
  );
}

function Bread() {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Oils</Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}
