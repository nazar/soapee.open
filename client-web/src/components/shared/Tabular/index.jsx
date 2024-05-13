import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import cx from 'clsx';

import { childrenProp } from 'services/propTypes';

import './container.styl';

export default function Tabular({ children, className, ...rest }) {
  return (
    <Table basic="very" compact className={cx('tabular-container', className)} {...rest}>
      <Table.Body>
        {children}
      </Table.Body>
    </Table>
  );
}

Tabular.defaultProps = {
  className: null
};

Tabular.propTypes = {
  children: childrenProp.isRequired,
  className: PropTypes.string
};

Tabular.Row = function Row({ children, ...rest }) {
  return <Table.Row {...rest}>{children}</Table.Row>;
};

Tabular.Row.propTypes = {
  children: childrenProp.isRequired
};

Tabular.Column = function Column({ children, minNumericWidth, ...rest }) {
  const klass = cx('tabular-column', { 'min-numeric-width': minNumericWidth });

  return (
    <Table.Cell {...rest} className={klass}>
      {children}
    </Table.Cell>
  );
};

Tabular.Column.defaultProps = {
  minNumericWidth: false
};

Tabular.Column.propTypes = {
  children: childrenProp.isRequired,
  minNumericWidth: PropTypes.bool
};

Tabular.Group = function Group({ children, className, ...rest }) {
  return (
    <div className={cx('tabular-group', className)} {...rest}>{children}</div>
  );
};

Tabular.Group.defaultProps = {
  className: null
};

Tabular.Group.propTypes = {
  children: childrenProp.isRequired,
  className: PropTypes.string
};
