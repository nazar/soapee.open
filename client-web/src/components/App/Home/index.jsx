import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Header, Ref, Grid, Icon } from 'semantic-ui-react';

import './home.styl';

export default function Home() {
  const aboutRef = React.createRef();

  return (
    <div className="main-landing">
      <div className="header-container">
        <div className="header clearfix">
          <div className="text-vertical-center">
            <h1>Soapee</h1>
            <h2>Soap Making Community and Resources</h2>
            <br />
            <Button
              primary
              size="massive"
              onClick={handleAbout}
            >
              Find Out More
            </Button>
          </div>
        </div>
      </div>

      <Container text id="start">
        <Ref innerRef={aboutRef}>
          <Header as="h2" textAlign="center">
            <Header.Content>Soapee is a Saponification Calculator and a Soap Recipe Database</Header.Content>
            <Header.Subheader>
              <Link to="/auth/signup">Register</Link> today to start creating, saving and sharing your soap recipes
            </Header.Subheader>
          </Header>
        </Ref>

        <Grid stackable id="features">
          <Grid.Row columns={2}>
            <Grid.Column className="row1">
              <Header icon textAlign="center">
                <Icon circular inverted name="calculator" size="massive" color="grey" />
                <Header.Content>Soap Calculator</Header.Content>
                <Header.Subheader>
                  <p>Make Solid or Liquid soaps.</p>
                  <Button primary as={Link} to="calculator">Start</Button>
                </Header.Subheader>
              </Header>
            </Grid.Column>

            <Grid.Column className="row1">
              <Header icon textAlign="center">
                <Icon circular inverted name="database" size="massive" color="grey" />
                <Header.Content>Recipe Database</Header.Content>
                <Header.Subheader>
                  <p>View user submitted recipes</p>
                  <Button primary as={Link} to="recipes">Start</Button>
                </Header.Subheader>
              </Header>
            </Grid.Column>

            <Grid.Column className="row2">
              <Header icon textAlign="center">
                <Icon circular inverted name="table" size="massive" color="grey" />
                <Header.Content>Oils Database</Header.Content>
                <Header.Subheader>
                  <p>View oil properties</p>
                  <Button primary as={Link} to="oils">Start</Button>
                </Header.Subheader>
              </Header>
            </Grid.Column>

            <Grid.Column className="row2">
              <Header icon textAlign="center">
                <Icon circular inverted name="wordpress forms" size="massive" color="grey" />
                <Header.Content>Community Forums</Header.Content>
                <Header.Subheader>
                  <p>View Forums and Posts</p>
                  <Button primary as={Link} to="forums">Start</Button>
                </Header.Subheader>
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </div>
  );

  function handleAbout() {
    return aboutRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}
