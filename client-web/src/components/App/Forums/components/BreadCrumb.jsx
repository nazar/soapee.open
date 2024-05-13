import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Segment, Breadcrumb as SemanticBreadcrumb } from 'semantic-ui-react';

export default function Breadcrumb({ activeSection, 'data-cy': dataCy }) {
  return (
    <Segment data-cy={dataCy}>
      <SemanticBreadcrumb>
        <SemanticBreadcrumb.Section as={Link} to="/">Home</SemanticBreadcrumb.Section>
        <SemanticBreadcrumb.Divider />
        <SemanticBreadcrumb.Section as={Link} to="/forums/home">
          Forums
        </SemanticBreadcrumb.Section>
        <SemanticBreadcrumb.Divider />
        <SemanticBreadcrumb.Section active>{activeSection}</SemanticBreadcrumb.Section>
      </SemanticBreadcrumb>
    </Segment>
  );
}

Breadcrumb.defaultProps = {
  'data-cy': null
};

Breadcrumb.propTypes = {
  activeSection: PropTypes.string.isRequired,
  'data-cy': PropTypes.string
};
