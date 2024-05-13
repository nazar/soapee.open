import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import useMedia, { mobile } from 'hooks/useMedia';

import './footer.styl';

export default function Footer() {
  const isMobile = useMedia(mobile);
  const columns = isMobile ? 1 : 2;
  const alignment = isMobile ? 'left' : 'right';

  return (
    <Segment inverted className="footer app-footer">
      <Grid container stackable columns={columns}>
        <Grid.Row>
          <Grid.Column>
            Soapee is a Saponification calculator, soap recipe and oils database
          </Grid.Column>

          <Grid.Column textAlign={alignment}>
            <Link to="/privacy">Privacy</Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
  );
}
