import React from 'react';
import PropTypes from 'prop-types';

import { InputNumber } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';

export default function NaohPurity({ register }) {
  return (
    <Tabular>
      <Tabular.Row>
        <Tabular.Column>
          <InputNumber
            name="naohPurity"
            label="% NaOH Purity - recommended 100%"
            placeholder="Purity as %"
            register={register}
          />
        </Tabular.Column>
      </Tabular.Row>
    </Tabular>
  );
}

NaohPurity.propTypes = {
  register: PropTypes.object.isRequired
};
