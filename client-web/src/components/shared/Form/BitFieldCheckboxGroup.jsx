import _ from 'lodash';
import React from 'react';
import { Form } from 'semantic-ui-react';

export default function BitFieldCheckboxGroup({ name, bitFields, register, ...rest }) {
  return _.map(bitFields, ({ bit, label }) => {
    const value = bit > 1 ? 1 << bit : 1;

    return (
      <div
        key={`${name}-bitfield-${bit}`}
        {...rest}
      >
        <Form.Checkbox
          label={label}
          {...register.registerBitfield(name, bit, value)}
        />
      </div>
    );
  });
}
