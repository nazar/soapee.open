import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Accordion, Breadcrumb, Container, Segment, Header, Message, Menu, Icon, Button } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';
import { Link, NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';

import AuthenticatedWrapper from 'components/shared/AuthenticatedWrapper';
import Group from 'components/shared/Group';
import LoginSignup from 'components/shared/Modals/LoginSignup';
import Section from 'components/shared/Section';

import LoginModalLink from 'components/shared/LoginModalLink';
import forumsQuery from 'components/shared/Forums/queries/forums.gql';

import AllForums from '../components/AllForums';
import MyForums from '../components/MyForums';
import MySubscribedForums from '../components/MySubscribedForums';
import ForumsTable from '../components/ForumsTable';

import './style.styl';


export default function List() {
  const { path } = useRouteMatch();

  return (
    <Container id="root-forums-list">
      <Helmet
        title="Forums - Soapee"
      />

      <Bread />

      <OfficialForums />
      <CreateForum />

      <Menu stackable>
        <Menu.Item exact name="Popular" as={NavLink} to={path} />
        <Menu.Item name="Recent" as={NavLink} to={`${path}/recent`} />

        <AuthenticatedWrapper>
          <Menu.Item name="Subscribed Forums" as={NavLink} to={`${path}/subscribed`} />
        </AuthenticatedWrapper>

        <AuthenticatedWrapper>
          <Menu.Item name="My Forums" as={NavLink} to={`${path}/mine`} />
        </AuthenticatedWrapper>

        <Menu.Item name="All" as={NavLink} to={`${path}/all`} />
      </Menu>

      <Switch>
        <Route path={`${path}/all`} component={AllForums} />
        <Route path={`${path}/mine`} component={MyForums} />
        <Route path={`${path}/recent`} component={RecentForums} />
        <Route path={`${path}/subscribed`} component={MySubscribedForums} />
        <Route path={path} component={PopularForums} />
      </Switch>
    </Container>
  );
}

function CreateForum() {
  return (
    <Message
      icon="comments outline"
      header="Looking for the perfect Forum?"
      data-cy="create-perfect-forum"
      content={<Content />}
    />
  );

  function Content() {
    const [open, setOpen] = useState();

    return (
      <div>
        Why not{' '}
        <LoginSignup><LoginModalLink to="/forums/create">create</LoginModalLink></LoginSignup>{' '}
        your own Forum?

        <Accordion>
          <Accordion.Title active={open} onClick={toggle}>
            <Icon name="dropdown" />
            <strong>Read more about Soapee Forums</strong>
          </Accordion.Title>

          <Accordion.Content active={open}>
            <p>
              Soapee Forums are designed to be created and used by our members. Once you create a forum, you will be
              able to moderate forums you own.
            </p>

            <p>
              Want to talk about specific soaping techniques and can't find a suitable forum? Create a forum!
            </p>

            <p>
              Want to talk about and promote your soap based business and support your customers? Create a Forum!
            </p>

            <p>
              Want to talk about and promote your oil and soaping supply based business and support your customers?
              Create a Forum!
            </p>

            <p>
              Soapee doesn't place any restrictions on commercial or non commercial forums. All Soapee asks is that
              forums be related to soap making and that all content is respectful and un-offensive.
            </p>

            <p>
              <strong>
                Forums that promote or discuss divisive ideas such as religion, nationalism, politics, race, gender,
                etc are not welcome and will be deleted.
              </strong>
            </p>
          </Accordion.Content>
        </Accordion>
      </div>
    );

    //

    function toggle() {
      setOpen(prev => !(prev));
    }
  }
}

function OfficialForums() {
  const { loading, data: { forums } = {} } = useQuery(forumsQuery, {
    variables: {
      search: {
        official: true
      },
      page: {
        limit: 10
      },
      order: {
        field: 'name'
      }
    }
  });

  return (
    <Section loading={loading} data-cy="official-forums">
      <Group className="official-forums-table">
        <Header>Official Forums</Header>

        <div className="search-link">
          <Button as={Link} to="/forums/search">Search</Button>
        </div>
      </Group>
      <ForumsTable skipCreate forums={forums} />
    </Section>
  );
}

function PopularForums() {
  const { loading, data: { forums } = {} } = useQuery(forumsQuery, {
    query: forumsQuery,
    variables: {
      search: {
        official: false
      },
      order: {
        field: 'popular',
        direction: 'desc'
      },
      page: {
        limit: 10
      }
    }
  });

  return (
    <Section shadow loading={loading} data-cy="popular-forums">
      <ForumsTable forums={forums} />
    </Section>
  );
}

function RecentForums() {
  const { loading, data: { forums } = {} } = useQuery(forumsQuery, {
    query: forumsQuery,
    variables: {
      search: {
        official: false
      },
      order: {
        field: 'createdAt',
        direction: 'desc'
      },
      page: {
        limit: 10
      }
    }
  });

  return (
    <Section shadow loading={loading} data-cy="recent-forums">
      <ForumsTable forums={forums} />
    </Section>
  );
}

function Bread() {
  return (
    <Segment>
      <Breadcrumb>
        <Breadcrumb.Section as={Link} to="/">Home</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section active>
          Forums
        </Breadcrumb.Section>
      </Breadcrumb>
    </Segment>
  );
}
