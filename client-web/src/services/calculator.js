import _ from 'lodash';

export function recipeSummary(recipeValues, oils) {
  const oilsLookup = _.keyBy(oils, 'id');

  let totalOilWeight;
  let totalWaterWeight;
  let totalLye;
  let totalNaoh;
  let totalKoh;
  let citricAdjustLye = 0;
  let citricAdjustKoh = 0;
  let citricAdjustNaoh = 0;
  let totalSuperfat;
  let lyeConcentration;
  let waterLyeRatio;
  let fragranceWeight;

  let breakdowns;
  let properties;
  let saturations;

  let recipeLyeConcentration;

  const citricAdjustPercentToValue = (recipeValues.citricAdjustPercent / 100);

  if (isPercentRecipe()) {
    totalOilWeight = totalWeight();
  } else {
    totalOilWeight = sumWeights();
  }

  if (superfatAfter()) {
    totalSuperfat = totalOilWeight * (recipeValues.superFat / 100);
  } else {
    totalSuperfat = 0;
  }

  if (isMixedRecipe()) {
    totalNaoh = _.sumBy(recipeWeightPairs(), ({ weightOrRatio, oilId }) => {
      return lyeRatioWeightForOilId('naoh', weightOrRatio, oilId);
    });

    totalKoh = _.sumBy(recipeWeightPairs(), ({ weightOrRatio, oilId }) => {
      return lyeRatioWeightForOilId('koh', weightOrRatio, oilId);
    });

    if (recipeValues.enableCitricAdjust) {
      const kohRatioAdjust = recipeValues.ratioKoh / 100;
      const naohRatioAdjust = recipeValues.ratioNaoh / 100;

      citricAdjustKoh = totalOilWeight * kohRatioAdjust * citricAdjustPercentToValue * citricAdjustForSoapType('koh');
      citricAdjustNaoh = totalOilWeight * naohRatioAdjust * citricAdjustPercentToValue * citricAdjustForSoapType('naoh');

      totalKoh = totalKoh + citricAdjustKoh;
      totalNaoh = totalNaoh + citricAdjustNaoh;
    }

    totalLye = totalNaoh + totalKoh;
  } else {
    if (recipeValues.enableCitricAdjust) {
      citricAdjustLye = totalOilWeight * citricAdjustPercentToValue * citricAdjustForSoapType(recipeValues.soapType);
    }

    totalLye = _.sumBy(recipeWeightPairs(), ({ weightOrRatio, oilId }) => {
      return lyeWeightForOilId(recipeValues.soapType, weightOrRatio, oilId);
    }) + citricAdjustLye;
  }

  if (recipeValues.fragranceType === 'ratio') {
    fragranceWeight = totalOilWeight * (recipeValues.fragrance / 100);
  } else if (_.includes(['kilo', 'gram'], uomToUse())) {
    fragranceWeight = totalOilWeight * (recipeValues.fragrancePpo / 1000);
  } else {
    fragranceWeight = totalOilWeight * (recipeValues.fragrancePpo / 16);
  }

  if (isLyeConentration()) {
    recipeLyeConcentration = (recipeValues.recipeLyeConcentration || 100) / 100;
    totalWaterWeight = (totalLye / recipeLyeConcentration) - totalLye;
    lyeConcentration = 100 * recipeLyeConcentration;
  } else if (isLyeWaterRatio()) {
    totalWaterWeight = totalLye * recipeValues.lyeWaterWaterRatio;
    lyeConcentration = 100 * (totalLye / (totalWaterWeight + totalLye));
  } else {
    totalWaterWeight = totalOilWeight * (recipeValues.waterRatio / 100);
    lyeConcentration = 100 * (totalLye / (totalWaterWeight + totalLye));
  }

  totalWaterWeight -= (((recipeValues.waterDiscount || 0) / 100) * totalWaterWeight);

  const totalBatchWeight = Number(totalOilWeight)
    + Number(totalWaterWeight)
    + Number(totalLye)
    + Number(fragranceWeight)
    + Number(totalSuperfat);

  if (totalWaterWeight + totalLye) {
    waterLyeRatio = totalWaterWeight / (totalLye || Infinity);

    breakdowns = recipeOilFatBreakdowns();
    properties = recipeOilProperties();
    saturations = recipeOilSaturations();
  }

  // the soap calculation and data needed to render the recipe

  return {
    totals: {
      totalOilWeight,
      totalWaterWeight,
      fragranceWeight,
      totalNaoh,
      totalKoh,
      totalLye,
      totalSuperfat,
      totalBatchWeight,
      lyeConcentration,
      waterLyeRatio,
      citricAdjustKoh,
      citricAdjustNaoh,
      citricAdjustLye
    },
    display: {
      convertWeightToGrams: weight => (weight / conversions()[uomToUse()]),
      countWeights: countWeights(),
      enableCitricAdjust: recipeValues.enableCitricAdjust,
      citricAdjustPercent: recipeValues.citricAdjustPercent,
      citricAcidWeight: citricAcidWeight(),
      isKohRecipe: recipeValues.soapType === 'koh',
      isMixedRecipe: isMixedRecipe(),
      isUomGrams: uomToUse() === 'gram',
      kohPurity: recipeValues.kohPurity,
      ratioKoh: recipeValues.ratioKoh,
      ratioNaoh: recipeValues.ratioNaoh,
      recipeOilsWeightsRatios: recipeOilsWeightsRatios(),
      roundPlaces: roundPlacesForUom(uomToUse()),
      roundPlacesForUom: uom => roundPlacesForUom(uom),
      soapTypeToLye: soapTypeToLye(),
      sumWeights: sumWeights(),
      sumWeightsUomRounded: sumWeightsUomRounded(),
      superFat: recipeValues.superFat,
      superfatAfter: superfatAfter(),
      totalsIncludeWater: recipeValues.totalsIncludeWater,
      uomToUse: uomToUse(),
      waterDiscount: recipeValues.waterDiscount
    },
    breakdowns,
    properties,
    saturations
  };

  // Implementation

  function isPercentRecipe() {
    return _.get(recipeValues, 'uom') === 'percent';
  }

  function isMixedRecipe() {
    return _.get(recipeValues, 'soapType') === 'mixed';
  }

  function totalWeight() {
    if (_.get(recipeValues, 'totalsIncludeWater')) {
      return recipeValues.totalWeight / (1 + (recipeValues.waterRatio / 100));
    } else {
      return _.get(recipeValues, 'totalWeight');
    }
  }

  function recipeWeights() {
    return _.chain(recipeValues)
      .get('oils')
      .reduce((result, oil) => {
        return _.tap(result, (r) => {
          r[oil.id] = Number(oil.weight) || 0;
        });
      }, {})
      .value();
  }

  function recipeWeightValues() {
    return _.values(recipeWeights());
  }

  function recipeWeightPairs() {
    return _.map(recipeWeights(), (weightOrRatio, oilId) => ({ weightOrRatio, oilId }));
  }

  function sumWeights() {
    return _.sum(recipeWeightValues());
  }

  function sumWeightsUomRounded() {
    const uom = uomToUse();
    const places = roundPlacesForUom(uom);

    return _.round(Number(sumWeights()), places);
  }

  function countWeights() {
    return _.chain(recipeValues)
      .get('oils')
      .map('weight')
      .filter(w => Number(w) > 0)
      .value()
      .length;
  }

  function citricAcidWeight() {
    if (recipeValues.enableCitricAdjust) {
      return citricAdjustPercentToValue * totalOilWeight;
    }
  }

  function superfatAfter() {
    return _.get(recipeValues, 'superfatAfter') === true;
  }

  function lyeWeightForOilId(lye, weightRatio, oilId) {
    if (weightRatio) {
      let oilWeight;
      let lyeGrams;

      if (isPercentRecipe()) {
        oilWeight = totalWeight() * (weightRatio / 100);
      } else {
        oilWeight = weightRatio;
      }

      const grams = convertToGrams(oilWeight);
      const oil = oilsLookup[oilId];

      lyeGrams = sapForSoapType(lye, oil) * grams;

      // factor in superfat discount
      if (!(recipeValues.superfatAfter)) {
        lyeGrams -= (recipeValues.superFat / 100) * lyeGrams;
      }

      return convertToUom(lyeGrams);
    } else {
      return 0;
    }
  }

  function sapForSoapType(lye, oil) {
    // kohPurity and naohPurity might be null - fallback to defaults
    const factors = {
      koh: ((recipeValues.kohPurity || 90) / 100),
      naoh: ((recipeValues.naohPurity || 100) / 100) * 1.403
    };

    return oil.sap / factors[lye];
  }

  function lyeRatioWeightForOilId(lye, weightRatio, oilId) {
    const amount = lyeWeightForOilId(lye, weightRatio, oilId);
    const ratio = recipeValues[`ratio${_.capitalize(lye)}`] / 100;

    return ratio * amount;
  }

  function uomToUse() {
    if (isPercentRecipe()) {
      return recipeValues.totalUom;
    } else {
      return recipeValues.uom;
    }
  }

  function isLyeConentration() {
    return recipeValues.lyeCalcType === 'concentration';
  }

  function isLyeWaterRatio() {
    return recipeValues.lyeCalcType === 'lyewater';
  }

  function convertToGrams(weightOrRatio) {
    return weightOrRatio * conversions()[uomToUse()];
  }

  function convertToUom(grams) {
    return grams / conversions()[uomToUse()];
  }

  function soapTypeToLye() {
    return {
      naoh: 'NaOH',
      koh: 'KOH',
      mixed: 'NaOH and KOH'
    }[recipeValues.soapType];
  }

  function recipeOilsWeightsRatios() {
    const _totalOilWeight = isPercentRecipe() ? totalWeight() : totalOilWeight;

    if (_totalOilWeight) {
      return _.map(recipeWeightPairs(), ({ weightOrRatio, oilId }) => {
        let ratio;
        let weight;

        const oil = oilsLookup[oilId];

        if (isPercentRecipe()) {
          ratio = weightOrRatio / 100;
          weight = _totalOilWeight * ratio;
        } else {
          ratio = weightOrRatio / _totalOilWeight;
          weight = weightOrRatio;
        }

        return {
          oil,
          ratio,
          weight
        };
      });
    }
  }

  function oilsRatiosMap() {
    const total = sumWeights();

    return _.map(recipeWeightPairs(), ({ weightOrRatio, oilId }) => {
      const ratio = isPercentRecipe() ? weightOrRatio / 100 : weightOrRatio / total;
      const oil = oilsLookup[oilId];

      return { oil, ratio };
    });
  }

  function recipeOilFatBreakdowns() {
    return _.reduce(oilsRatiosMap(), (result, { oil, ratio }) => {
      return _.tap(result, (r) => {
        _.each(oil.breakdown, (acidRatio, fattyAcid) => {
          r[fattyAcid] = (r[fattyAcid] || 0) + acidRatio * ratio;
        });
      });
    }, {});
  }

  function recipeOilProperties() {
    return _.reduce(oilsRatiosMap(), (result, { oil, ratio }) => {
      return _.tap(result, (r) => {
        _.each(oil.properties, (value, key) => {
          r[key] = (r[key] || 0) + oil.properties[key] * ratio;
        });

        _.each(['iodine', 'ins'], (key) => {
          r[key] = (r[key] || 0) + oil[key] * ratio;
        });
      });
    }, {});
  }

  function recipeOilSaturations() {
    return _.reduce(oilsRatiosMap(), (result, { oil, ratio }) => {
      return _.tap(result, (r) => {
        const saturated = _.chain(oil.breakdown)
          .filter(
            (percent, type) => _.includes(['caprylic', 'capric', 'lauric', 'myristic', 'palmitic', 'stearic'], type)
          )
          .sum()
          .value() * ratio;

        r.saturated += saturated;
        r.unsaturated -= saturated;
      });
    }, { saturated: 0, unsaturated: 100 });
  }
}

export function conversions() {
  return {
    gram: 1,
    kilo: 0.001,
    pound: 0.00220462,
    ounce: 0.035274
  };
}

export function roundPlacesForUom(uom) {
  return {
    gram: 1,
    ounce: 2,
    kilo: 3,
    pound: 3
  }[uom];
}

function citricAdjustForSoapType(soapType) {
  return {
    koh: 0.842,
    naoh: 0.624
  }[soapType];
}
