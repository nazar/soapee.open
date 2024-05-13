import _ from 'lodash';
import * as yup from 'yup';

import { yupStringSanitize } from 'services/sanitiseHtml';

export default yup.object({
  name: yup.string().min(3).max(100).required(),
  description: yup.string().transform(yupStringSanitize).nullable(),
  notes: yup.string().transform(yupStringSanitize).nullable(),

  visibility: yup.number().required(0).oneOf([0, 1, 2]),

  summary: yup.object({
    totals: yup.object({
      totalOilWeight: yup.number(),
      totalWaterWeight: yup.number(),
      fragranceWeight: yup.number(),
      totalLye: yup.number(),
      totalSuperfat: yup.number(),
      totalBatchWeight: yup.number(),
      lyeConcentration: yup.number(),
      waterLyeRatio: yup.number()
    }),
    breakdowns: yup.object({
      oleic: yup.number(),
      capric: yup.number(),
      lauric: yup.number(),
      stearic: yup.number(),
      caprylic: yup.number(),
      linoleic: yup.number(),
      myristic: yup.number(),
      palmitic: yup.number(),
      linolenic: yup.number(),
      ricinoleic: yup.number()
    }),
    properties: yup.object({
      bubbly: yup.number(),
      cleansing: yup.number(),
      condition: yup.number(),
      hardness: yup.number(),
      longevity: yup.number(),
      stable: yup.number(),
      iodine: yup.number(),
      ins: yup.number()
    }),
    saturations: yup.object({
      saturated: yup.number(),
      unsaturated: yup.number()
    })
  }),

  settings: yup.object({
    uom: yup.string().oneOf(['percent', 'gram', 'kilo', 'pound', 'ounce']).required(),
    uomType: yup.string().default('weights'),
    uomDimensionType: yup.string().default('box'),
    dimensionWidth: yup.number().min(0),
    dimensionHeight: yup.number().min(0),
    dimensionLength: yup.number().min(0),
    dimensionDiameter: yup.number().min(0),
    ratioKoh: yup.number().min(0).max(100),
    soapType: yup.string().oneOf(['naoh', 'koh', 'mixed']).required(),
    superFat: yup.number().min(-10).max(100).required()
      .label('Super fat'),
    kohPurity: yup.number().min(0).max(100),
    naohPurity: yup.number().min(0).max(100),
    ratioNaoh: yup.number().min(0).max(100),
    waterRatio: yup.number().min(0),
    lyeCalcType: yup.string().oneOf(['ratio', 'concentration', 'lyewater']).required(),
    totalWeight: yup.number().min(0).required(),
    recipeLyeConcentration: yup.number().min(0).required(),
    fragrancePpo: yup.number().min(0),
    fragranceType: yup.string().oneOf(['ratio', 'ppo']),
    waterDiscount: yup.number().min(0),
    lyeWaterLyeRatio: yup.number().min(0).required(),
    lyeWaterWaterRatio: yup.number().min(0).required(),
    totalUom: yup.string()
      .when('uom', {
        is: val => val === 'percent',
        then: yup.string().required(),
        otherwise: yup.string().nullable()
      }) // write a manual test since .oneOf doesn't seem to work with .when
      .test('valid-uom',
        // eslint-disable-next-line no-template-curly-in-string
        '${value} must be one of gram, kilo, pound of ounce',
        value => _.includes(['gram', 'kilo', 'pound', 'ounce'], value)
      ),
    fragrance: yup.number().min(0),
    totalsIncludeWater: yup.boolean(),
    superfatAfter: yup.boolean(),
    enableCitricAdjust: yup.boolean().default(false),
    citricAdjustPercent: yup.number().min(0).default(1),
    additives: yup.array().of(
      yup.object({
        id: yup.number().required(),
        weight: yup.string().ensure().nullable()
      })
    ),

    oils: yup.array().of(
      yup.object({
        id: yup.number().required(),
        weight: yup.number().required().typeError('is not a number')
      })
    )
      .min(1, 'At least one Oil is required')
      .required('At least one Oil is required')
      .test('full-ratio-weights', 'Oil ratios must equal 100%', function(value) {
        if (this.parent.uom === 'percent') {
          const sumRatios = _.sumBy(value, 'weight');

          return Math.abs(100 - sumRatios) < 0.1;
        } else {
          return true;
        }
      })
      .test('above-zero-weight', 'Oils weights must be above 0', function(value) {
        if (this.parent.uom !== 'percent') {
          const sumWeights = _.sumBy(value, 'weight');

          return sumWeights > 1;
        } else {
          return true;
        }
      })
  })
});
