import React from 'react';
import PropTypes from 'prop-types';

import { Radio } from 'components/shared/Form';

export default function Visibility({ register }) {
  return (
    <div>
      <Radio
        name="visibility"
        value={0}
        register={register}
        label={<label><strong>Private</strong> - only visible to you</label>}
      />

      <Radio
        name="visibility"
        value={2}
        register={register}
        label={<label><strong>Friends</strong> - also visible to your friends</label>}
      />

      <Radio
        name="visibility"
        value={1}
        register={register}
        label={<label><strong>Public</strong> - visible to everyone</label>}
      />
    </div>
  );
}

Visibility.propTypes = {
  register: PropTypes.object.isRequired
};
