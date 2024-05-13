import React from 'react';
import PropTypes from 'prop-types';

import './subTitle.styl';

export default function SubTitle({ children }) {
  return (
    <div className="sub-title" data-cy="sub-title">
      {children}
    </div>
  );
}

SubTitle.propTypes = {
  children: PropTypes.array.isRequired
};
