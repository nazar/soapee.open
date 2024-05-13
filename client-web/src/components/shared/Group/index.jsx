import React from 'react';
import PropTypes from 'prop-types';
import cx from 'clsx';

import { childrenProp } from 'services/propTypes';

import './style.styl';

export default function Group({ children, className, direction, gap, fullWidth, align, justify, 'data-cy': dataCy, ...rest }) {
  const klass = cx('group-component',
    className,
    direction && `direction-${direction}`,
    `gap-${gap}`,
    align && `align-${align}`,
    justify && `justify-${justify}`,
    {
      'full-width': fullWidth
    }
  );

  return (
    <div className={klass} data-cy={dataCy} {...rest}>
      {children}
    </div>
  );
}

Group.defaultProps = {
  className: null,
  align: null,
  justify: null,
  direction: 'row',
  'data-cy': null,
  gap: '2',
  fullWidth: false
};

Group.propTypes = {
  className: PropTypes.string,
  children: childrenProp.isRequired,
  align: PropTypes.oneOf(['stretch', 'start', 'center', 'end']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'space']),
  direction: PropTypes.oneOf(['row', 'column']),
  'data-cy': PropTypes.string,
  gap: PropTypes.oneOf(['0', '1', '2', '3', '4', '5']),
  fullWidth: PropTypes.bool
};

export function Column({ children, className, gap, align, 'data-cy': dataCy, ...rest }) {
  return (
    <Group className={className} direction="column" gap={gap} align={align} data-cy={dataCy} {...rest}>
      {children}
    </Group>
  );
}

Column.defaultProps = {
  className: null,
  align: null,
  'data-cy': null,
  gap: '2'
};

Column.propTypes = {
  className: PropTypes.string,
  children: childrenProp.isRequired,
  align: PropTypes.oneOf(['stretch', 'start', 'center', 'end']),
  'data-cy': PropTypes.string,
  gap: PropTypes.oneOf(['1', '2', '3', '4', '5'])
};
