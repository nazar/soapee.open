import _ from 'lodash';

export default function oilProperties(oil) {
  const properties = buildProperties();
  const saturation = saturationBreakdown();

  return {
    ...oil,
    properties,
    saturation
  };

  //

  function buildProperties() {
    return {
      bubbly: propertyValueForOil(oil, ['lauric', 'myristic', 'ricinoleic', 'caprylic', 'capric']),
      cleansing: propertyValueForOil(oil, ['lauric', 'myristic', 'caprylic', 'capric']),
      // eslint-disable-next-line max-len
      condition: propertyValueForOil(oil, ['ricinoleic', 'oleic', 'linoleic', 'linolenic', 'eicosenoic', 'docosenoid', 'docosadienoic', 'erucic']),
      hardness: propertyValueForOil(oil, ['lauric', 'myristic', 'palmitic', 'stearic', 'caprylic', 'capric']),
      longevity: propertyValueForOil(oil, ['palmitic', 'stearic']),
      stable: propertyValueForOil(oil, ['palmitic', 'stearic', 'ricinoleic'])
    };
  }

  function saturationBreakdown() {
    return _.transform(saturationBreakdowns(), (result, fats, group) => {
      result[group] = propertyValueForOil(oil, fats);
    });
  }


  function propertyValueForOil(_oil, fats) {
    return _.reduce(fats, (total, fat) => {
      return total + (_oil.breakdown[fat] || 0);
    }, 0);
  }

  function saturationBreakdowns() {
    return {
      saturated: _(fattyOils)
        .pickBy(filterByMatch(':0'))
        .keys()
        .value(),
      monoSaturated: _(fattyOils)
        .pickBy(filterByMatch(':1'))
        .keys()
        .value(),
      polySaturated: _(fattyOils)
        .pickBy(filterByMatch(':2'))
        .keys()
        .value()
    };
  }

  function filterByMatch(matcher) {
    return (oilType) => {
      return oilType.match(matcher);
    };
  }
}

export function sapForNaOh(_oil) {
  return _oil && _.round(_oil.sap / 1.403, 3);
}

export function acidDescription(acid) {
  return fattyAcidDescriptions[acid];
}


export const fattyAcids = [
  // eslint-disable-next-line max-len
  'capric', 'caprylic', 'docosadienoic', 'docosenoid', 'eicosenoic', 'erucic', 'lauric', 'linoleic', 'linolenic', 'myristic', 'oleic', 'palmitic', 'ricinoleic', 'stearic'
];

const fattyAcidDescriptions = {
  lauric: 'A saturated fatty acid which is responsible for big fluffy lather, has good cleansing properties and hardens the bar. On the contrary it\'s longevity is reduced and the cleansing level is potent enough to be unpleasantly drying',
  linoleic: 'An unsaturated fatty acid which makes for a soft bar with moisturizing and conditioning qualities but high amounts decrease shelf life (rancidity potential)',
  linolenic: 'An unsaturated fatty acid which shares properties with Linoleic Acid. They both are rich in Omega 3 and 6',
  myristic: 'A saturated fatty acid which shares features with Lauric Acid as they are commonly found together in oils',
  oleic: 'An unsaturated fatty acid that contributes to a hard, moisturizing and conditioning bar and improves shelf life (rancidity potential)',
  palmitic: ' A saturated fatty acid that helps with the longevity and hardness of the bar with stable and creamy lather',
  ricinoleic: 'An unsaturated fatty acid that creates a hard bar with great conditioning and moisturizing qualities. It also adds creaminess and helps stabilize big fluffy lather',
  stearic: 'A saturated fatty acid which makes for hard bar with stable and creamy lather'
};

const fattyOils = {
  capric: '10:0',
  caprylic: '8:0',
  docosadienoic: '22:2',
  docosenoid: '22:1',
  eicosenoic: '20:1',
  erucic: '22:1',
  lauric: '12:0',
  linoleic: '18:2',
  linolenic: '18:3',
  myristic: '14:0',
  oleic: '18:1',
  palmitic: '16:0',
  ricinoleic: '18:1',
  stearic: '18:0'
};
