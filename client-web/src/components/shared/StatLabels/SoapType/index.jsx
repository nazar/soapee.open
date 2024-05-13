import React from 'react';
import { Label, Popup } from 'semantic-ui-react';

import iconLiquid from './lotion.svg';
import iconSolid from './soap.svg';
import iconHybrid from './hybrid.svg';

export default function SoapType({ recipe, size }) {
  if (recipe) {
    const content = {
      koh: 'KOH - Liquid Soap',
      naoh: 'NaOH - Solid Soap',
      mixed: 'KOH and NaOH - Hybrid Soap'
    }[recipe.settings.soapType];

    return (
      <Popup
        trigger={<SoapTypeLabel />}
        content={content}
      />
    );
  } else {
    return null;
  }

  //

  function SoapTypeLabel(props) {
    const icon = {
      koh: iconLiquid,
      naoh: iconSolid,
      mixed: iconHybrid
    }[recipe.settings.soapType];

    return (
      <Label className="soap-type-label" size={size} {...props}>
        <img className="svg-icon" src={icon} alt="" />
      </Label>
    );
  }
}
