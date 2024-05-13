import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Breadcrumb, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import FeedList from 'components/App/Feed/components/FeedList';

import getFeedSummaryQuery from './queries/getFeedSummary.gql';
import getFeedQuery from './queries/getFeed.gql';

export default function List() {
  const itemsQuery = {
    query: getFeedQuery,
    dataKey: 'getFeed',
    variables: {
      order: {
        field: 'createdAt',
        direction: 'desc'
      }
    }
  };

  const summaryQuery = {
    query: getFeedSummaryQuery,
    dataKey: 'getFeedSummary'
  };

  return (
    <Container className="view-page">
      <Helmet
        title="Public Feed - Soapee"
      />

      <Bread />

      <FeedList
        summaryQuery={summaryQuery}
        itemsQuery={itemsQuery}
      />
    </Container>
  );
}

function Bread() {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>Public Feed</Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}
