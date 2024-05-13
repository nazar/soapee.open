import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Placeholder as SemanticPlaceholder } from 'semantic-ui-react';

export default function Placeholder({ lines }) {
  return (
    <SemanticPlaceholder fluid>
      <SemanticPlaceholder.Paragraph>
        {_.times(lines, index => <SemanticPlaceholder.Line key={index} />)}
      </SemanticPlaceholder.Paragraph>
    </SemanticPlaceholder>
  );
}

Placeholder.defaultProps = {
  lines: 5
};

Placeholder.propTypes = {
  lines: PropTypes.number
};
