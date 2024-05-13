import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import cx from 'clsx';

import roundFormatted from './utils/roundFormatted';

export default function RecipeTotals({ recipe, printable, ...rest }) {
  const uom = `${recipe.display.uomToUse}s`;
  const places = recipe.display.roundPlaces;
  const discount = recipe.display.waterDiscount ? `(${recipe.display.waterDiscount}% less)` : '';
  const classname = cx({ printable });

  return (
    <Table className={classname} compact striped {...rest}>
      <Table.Body>
        {recipe.display.totalsIncludeWater && (
          <Table.Row>
            <Table.Cell colSpan="3">
              Oil weight accounts for water
            </Table.Cell>
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            Total Water Weight
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-total-water-weight">
            {`${roundedValue('totals.totalWaterWeight', places)} ${uom} ${discount}`}
          </Table.Cell>

          { gramsColumn('totals.totalWaterWeight') }
        </Table.Row>

        {recipe.display.isMixedRecipe && (
          <>
            {recipe.display.enableCitricAdjust && (
              <>
                <Table.Row>
                  <Table.Cell>
                    Citric Acid Weight
                  </Table.Cell>
                  <Table.Cell data-cy="recipe-totals-mixed-citric-weight">
                    {`${roundedValue('display.citricAcidWeight', places)} ${uom} - ${recipe.display.citricAdjustPercent} % of oils`}
                  </Table.Cell>
                  { gramsColumn('display.citricAcidWeight') }
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    Citric Acid KoH Adjust
                  </Table.Cell>
                  <Table.Cell data-cy="recipe-totals-mixed-citric-koh-adjust">
                    {`${roundedValue('totals.citricAdjustKoh', places)} ${uom}`}
                  </Table.Cell>
                  { gramsColumn('totals.citricAdjustKoh') }
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    Citric Acid NaOH Adjust
                  </Table.Cell>
                  <Table.Cell data-cy="recipe-totals-mixed-citric-naoh-adjust">
                    {`${roundedValue('totals.citricAdjustNaoh', places)} ${uom}`}
                  </Table.Cell>
                  { gramsColumn('totals.citricAdjustNaoh') }
                </Table.Row>
              </>
            )}

            <Table.Row>
              <Table.Cell>
                Total NaOH Weight
              </Table.Cell>
              <Table.Cell data-cy="recipe-totals-total-mixed-naoh-weight">
                {`${roundedValue('totals.totalNaoh', places)} ${uom}`}
              </Table.Cell>
              { gramsColumn('totals.totalNaoh') }
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                Total KoH Weight
              </Table.Cell>
              <Table.Cell data-cy="recipe-totals-total-mixed-koh-weight">
                {`${roundedValue('totals.totalKoh', places)} ${uom} at ${recipe.display.kohPurity}% purity`}
              </Table.Cell>
              { gramsColumn('totals.totalKoh') }
            </Table.Row>

            <Table.Row>
              <Table.Cell>
                Total Lye Weight
              </Table.Cell>
              <Table.Cell data-cy="recipe-totals-total-mixed-lye-weight">
                {`${roundedValue('totals.totalLye', places)} ${uom}`}
              </Table.Cell>
              { gramsColumn('totals.totalLye') }
            </Table.Row>
          </>
        )}

        {!(recipe.display.isMixedRecipe) && (
          <>
            {recipe.display.enableCitricAdjust && (
              <>
                <Table.Row>
                  <Table.Cell>
                    Citric Acid Weight
                  </Table.Cell>
                  <Table.Cell data-cy="recipe-totals-mixed-citric-weight">
                    {`${roundedValue('display.citricAcidWeight', places)} ${uom} - ${recipe.display.citricAdjustPercent} % of oils`}
                  </Table.Cell>
                  { gramsColumn('display.citricAcidWeight') }
                </Table.Row>

                <Table.Row>
                  <Table.Cell>
                    Citric Acid {recipe.display.soapTypeToLye} Adjust
                  </Table.Cell>
                  <Table.Cell data-cy="recipe-totals-mixed-citric-lye-adjust">
                    {`${roundedValue('totals.citricAdjustLye', places)} ${uom}`}
                  </Table.Cell>
                  { gramsColumn('totals.citricAdjustLye') }
                </Table.Row>
              </>
            )}

            <Table.Row>
              <Table.Cell>
                Total {recipe.display.soapTypeToLye} Weight
              </Table.Cell>
              <Table.Cell data-cy="recipe-totals-total-lye-weight">
                {`${roundedValue('totals.totalLye', places)} ${uom} ${purityInfo()}`}
              </Table.Cell>
              { gramsColumn('totals.totalLye') }
            </Table.Row>
          </>
        )}

        <Table.Row>
          <Table.Cell>
            Total Oil Weight
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-total-oil-weight">
            {`${roundedValue('totals.totalOilWeight', places)} ${uom}`}
          </Table.Cell>
          { gramsColumn('totals.totalOilWeight') }
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            Fragrance Oil Weight
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-total-fragrance-weight">
            {`${roundedValue('totals.fragranceWeight', places)} ${uom}`}
          </Table.Cell>
          { gramsColumn('totals.fragranceWeight') }
        </Table.Row>

        {recipe.display.superfatAfter && (
          <Table.Row>
            <Table.Cell>
              Superfat after cook
            </Table.Cell>
            <Table.Cell data-cy="recipe-totals-total-superfat-weight">
              {`${roundedValue('totals.totalSuperfat', places)} ${uom}`}
            </Table.Cell>
            { gramsColumn('totals.totalSuperfat') }
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            Total Batch Weight
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-total-batch-weight">
            {`${roundedValue('totals.totalBatchWeight', places)} ${uom}`}
          </Table.Cell>
          { gramsColumn('totals.totalBatchWeight') }
        </Table.Row>

        {!(recipe.display.superfatAfter) && (
          <Table.Row>
            <Table.Cell>
              Superfat
            </Table.Cell>
            <Table.Cell data-cy="recipe-totals-superfat">
              { recipe.display.superFat }%
            </Table.Cell>
            { gramsColumn() }
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            Lye Concentration
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-lye-concentration">
            { roundedValue('totals.lyeConcentration', places) }%
          </Table.Cell>
          { gramsColumn() }
        </Table.Row>

        {recipe.display.isMixedRecipe && (
          <Table.Row>
            <Table.Cell>
              NaOH / KOH Ratio
            </Table.Cell>
            <Table.Cell data-cy="recipe-totals-total-mixed-ratio">
              { recipe.display.ratioNaoh }% / { recipe.display.ratioKoh }%
            </Table.Cell>
            {!(recipe.display.isUomGrams) && (
              <Table.Cell>&nbsp;</Table.Cell>
            )}
          </Table.Row>
        )}

        <Table.Row>
          <Table.Cell>
            Water : Lye Ratio
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-water-lye-ratio">
            { roundedValue('totals.waterLyeRatio', 3) } <strong>:</strong> 1
          </Table.Cell>
          { gramsColumn() }
        </Table.Row>

        <Table.Row>
          <Table.Cell>
            Saturated : Unsaturated
          </Table.Cell>
          <Table.Cell data-cy="recipe-totals-saturated-ratio">
            { roundedSaturation('saturated') } <strong>:</strong> { roundedSaturation('unsaturated') }
          </Table.Cell>
          { gramsColumn() }
        </Table.Row>
      </Table.Body>
    </Table>
  );

  // helper functions

  function roundedValue(key, precision) {
    const keyValue = _.get(recipe, key);

    return roundFormatted(keyValue, precision);
  }

  function roundedSaturation(fatType) {
    const keyValue = _.get(recipe, `saturations.${fatType}`);

    return _.round(keyValue);
  }

  function purityInfo() {
    if (recipe.display.isKohRecipe) {
      return `at ${recipe.display.kohPurity}% purity`;
    } else {
      return '';
    }
  }

  function gramsColumn(key) {
    const placesGrams = recipe.display.roundPlacesForUom('gram');

    if (!(recipe.display.isUomGrams)) {
      if (key) {
        return (
          <Table.Cell>
            { inGrams(key, placesGrams) }
          </Table.Cell>
        );
      } else {
        return <Table.Cell>&nbsp;</Table.Cell>;
      }
    }
  }

  function inGrams(key, precision) {
    const weight = _.get(recipe, key);

    if (!(recipe.display.isUomGrams)) {
      const value = roundFormatted(recipe.display.convertWeightToGrams(weight), precision);

      return <span className="gram-convert">{ value } g</span>;
    }
  }
}

RecipeTotals.defaultProps = {
  printable: false
};

RecipeTotals.propTypes = {
  recipe: PropTypes.object.isRequired,
  printable: PropTypes.bool
};
