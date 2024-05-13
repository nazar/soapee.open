import React from 'react';
import PropTypes from 'prop-types';

import { TableProperties, TableSapValues } from 'components/shared/OilProperties';

export default function PropertiesOil({ oil }) {
  return (
    <div className="oi-properties">
      <TableSapValues oil={oil} />
      <TableProperties oil={oil} />
    </div>
  );
}

PropertiesOil.propTypes = {
  oil: PropTypes.object.isRequired
};
