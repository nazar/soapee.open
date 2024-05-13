import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'semantic-ui-react';

import { Radio } from 'components/shared/Form';

import KohPurity from './KohPurity';
import MixedRatios from './MixedRatios';
import NaohPurity from './NaohPurity';

export default function SoapType({ formState, register }) {
  const { soapType } = formState;

  return (
    <div className="soap-type">
      <Radio
        name="soapType"
        value="naoh"
        register={register}
        data-cy="soap-type-naoh"
        label={<label><strong>Solid</strong> Soap - using <strong>NaOH</strong> (Sodium Hydroxide)</label>}
      />

      <Radio
        name="soapType"
        value="koh"
        register={register}
        data-cy="soap-type-koh"
        label={(
          <label><strong>Liquid</strong> Soap - using <strong>KOH</strong> (Potassium
            Hydroxide)
          </label>
        )}
      />

      <Radio
        id="soapeType-mixed"
        name="soapType"
        value="mixed"
        register={register}
        data-cy="soap-type-mixed"
        label={(
          <label><strong>Hybrid</strong> Soap - using
            both <strong>KOH</strong> and <strong>NaOH</strong>
          </label>
        )}
      />

      <Transition duration={200} unmountOnHide visible={isMixed()}>
        <MixedRatios formState={formState} register={register} />
      </Transition>

      <Transition duration={200} unmountOnHide visible={hasNaoh()}>
        <NaohPurity register={register} />
      </Transition>

      <Transition duration={200} unmountOnHide visible={hasKoh()}>
        <KohPurity register={register} />
      </Transition>
    </div>
  );

  function isMixed() {
    return soapType === 'mixed';
  }

  function hasKoh() {
    return _.includes(['koh', 'mixed'], soapType);
  }

  function hasNaoh() {
    return _.includes(['naoh', 'mixed'], soapType);
  }
}

SoapType.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired
};
