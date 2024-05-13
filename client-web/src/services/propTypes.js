import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const childrenProp = PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.array]);
