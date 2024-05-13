import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Segment } from 'semantic-ui-react';
import cx from 'clsx';

import Placeholder from 'components/shared/Placeholder';

import './section.styl';

// FIXME - this component has an issue when it contains inputs: they loose focus on refresh
/* eslint-disable no-nested-ternary */
export default function Section({
  children,
  className,
  loading,
  'data-cy': dataCy,
  basic = true,
  padded = false,
  shadow = false,
  ...rest
} = {}) {
  return (
    <Segment
      basic={basic}
      padded={padded}
      loading={loading}
      className={cx(className, 'section', { shadow })}
      data-cy={dataCy}
      {...rest}
    >
      {}
      { loading ? <Placeholder /> : (_.isFunction(children) ? children() : children) }
    </Segment>
  );
}

Section.defaultProps = {
  className: null,
  loading: false,
  basic: true,
  padded: false,
  shadow: false,
  'data-cy': null
};

Section.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.bool, PropTypes.node]).isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  'data-cy': PropTypes.string,
  basic: PropTypes.bool,
  padded: PropTypes.bool,
  shadow: PropTypes.bool
};
