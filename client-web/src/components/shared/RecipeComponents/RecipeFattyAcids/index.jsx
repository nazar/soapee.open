import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import cx from 'clsx';

import { acidDescription } from 'services/oilProperties';
import TooltipQuestion from 'components/shared/TooltipQuestion';

import './style.styl';

export default function RecipeFattyAcids({ recipe, printable, showTooltips, ...rest }) {
  const classname = cx('recipe-fatty-acids-component', { printable });

  return (
    <Table className={classname} unstackable compact striped {...rest}>
      <Table.Body>
        <OrderedBreakdowns recipe={recipe} showTooltips={showTooltips} />
      </Table.Body>
    </Table>
  );
}

RecipeFattyAcids.defaultProps = {
  printable: false,
  showTooltips: false
};

RecipeFattyAcids.propTypes = {
  recipe: PropTypes.object.isRequired,
  printable: PropTypes.bool,
  showTooltips: PropTypes.bool
};

function OrderedBreakdowns({ recipe, showTooltips }) {
  const breakdowns = _.get(recipe, 'breakdowns');

  return _(breakdowns)
    .keys()
    .sort()
    // eslint-disable-next-line array-callback-return
    .map((fattyAcid) => {
      const value = _.round(breakdowns[fattyAcid]);

      if (value) {
        return (
          <Table.Row key={`fatty-acid-prop-${fattyAcid}`} data-cy={`fatty-acid-prop-${fattyAcid}`}>
            <Table.Cell>
              {showTooltips && (
                <AcidTooltip fattyAcid={fattyAcid} />
              )}

              {_.capitalize(fattyAcid)}
            </Table.Cell>
            <Table.Cell>{value}</Table.Cell>
          </Table.Row>
        );
      }
    })
    .compact()
    .value();
}

function AcidTooltip({ fattyAcid }) {
  const description = acidDescription(fattyAcid);

  if (description) {
    return (
      <TooltipQuestion>
        {description}
      </TooltipQuestion>
    );
  } else {
    return (
      <div className="placeholder">
        &nbsp;
      </div>
    );
  }
}
