import React from 'react';
import PropTypes from 'prop-types';

import { InputNumber } from 'components/shared/Form';
import Tabular from 'components/shared/Tabular';

export default function KohPurity({ register }) {
  return (
    <Tabular>
      <Tabular.Row>
        <Tabular.Column>
          <InputNumber
            name="kohPurity"
            label="% KOH Purity - recommended 90%"
            placeholder="Purity as %"
            register={register}
          />
        </Tabular.Column>
      </Tabular.Row>
    </Tabular>
  );
}

KohPurity.propTypes = {
  register: PropTypes.object.isRequired
};
