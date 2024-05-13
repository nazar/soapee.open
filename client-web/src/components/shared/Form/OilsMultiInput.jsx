import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { useCreation } from 'ahooks';

import Dropdown from './Dropdown';

export default function OilsMultiInput({ name, oils, ...rest }) {
  const options = useCreation(() => _.map(oils, oil => ({
    key: `oil-${oil.id}`,
    value: oil.id,
    text: oil.name
  })), [oils]);

  return (
    <Dropdown
      name={name}
      options={options}
      clearable
      fluid
      multiple
      search
      selection
      {...rest}
    />
  );
}

OilsMultiInput.propTypes = {
  name: PropTypes.string.isRequired,
  oils: PropTypes.array.isRequired
};
