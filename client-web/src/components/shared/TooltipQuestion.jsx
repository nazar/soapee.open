import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popup } from 'semantic-ui-react';

export default function TooltipQuestion({ children, ...rest }) {
  return (
    <Popup trigger={<Icon link name="question circle" />} {...rest}>
      {children}
    </Popup>
  );
}

TooltipQuestion.propTypes = {
  children: PropTypes.node.isRequired
};
