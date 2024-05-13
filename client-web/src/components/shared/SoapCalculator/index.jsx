import _ from 'lodash';
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Form, Grid, Header, Segment } from 'semantic-ui-react';
import { useCreation } from 'ahooks';
import hashSum from 'hash-sum';
import * as yup from 'yup';

import noop from 'services/noop';
import { recipeSummary } from 'services/calculator';

import useMyAdditives from 'hooks/useMyAdditives';
import useCurrentUser from 'hooks/useCurrentUser';

import { useForm, ErrorMessage, ErrorsSummary } from 'components/shared/Form';

import LoginToCreatePostCTA from 'components/shared/LoginToCreatePostCTA';
import AdditiveBreakdown from 'components/shared/RecipeComponents/AdditiveBreakdown';
import OilBreakdown from 'components/shared/RecipeComponents/OilBreakdown';
import RecipeFattyAcids from 'components/shared/RecipeComponents/RecipeFattyAcids';
import RecipeProperties from 'components/shared/RecipeComponents/RecipeProperties';
import RecipeTotals from 'components/shared/RecipeComponents/RecipeTotals';
import Section from 'components/shared/Section';
import { analyticsEvent } from 'components/shared/GAEventReporter';

import AdditivesCalculationTweaks from './components/AdditivesCalculationTweaks';
import AmountOfWater from './components/AmountOfWater';
import Buttons from './components/Buttons';
import Description from './components/Description';
import Fragrances from './components/Fragrances';
import ListAdditivesRecipe from './components/ListAdditivesRecipe';
import ListAdditivesSelector from './components/ListAdditivesSelector';
import ListOilsRecipe from './components/ListOilsRecipe';
import ListOilsSelector from './components/ListOilsSelector';
import OilSuperfat from './components/OilSuperfat';
import SoapType from './components/SoapType';
import UnitsOfMeasure from './components/UnitsOfMeasure';
import Visibility from './components/Visibility';
import RecipeImage from './components/RecipeImage';

import './soapCalculator.styl';


export default function SoapCalculator({
  recipe,
  oils,
  saveAction,
  canSaveAsCopy,
  onSave,
  onSaveAsCopy,
  onPrint
}) {
  const { formState, errors, register, setFormValues, submitForm, resetForm, submitting } = useForm({
    initialValues: recipeToFormPayload,
    validation: validationSchema,
    onSubmit: handleFormSubmit
  });

  const [imageData, setImageData] = useState({});

  const summary = useCreation(
    () => !(_.isEmpty(oils)) && recipeSummary(formState, oils),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hashSum(formValuesForUseMemo()), hashSum(oils)]
  );

  const currentUser = useCurrentUser();
  const [additives,, refetchAdditives] = useMyAdditives();

  return (
    <Section>
      <Form className="soap-calculator">
        <Grid stackable doubling columns={2}>
          <Grid.Row>
            <Grid.Column>
              <Header block attached="top"><strong>1 - Liquid</strong> or <strong>Solid</strong> soap recipe?</Header>
              <Segment attached>
                <SoapType formState={formState} register={register} />
              </Segment>
            </Grid.Column>

            <Grid.Column>
              <Header block attached="top">2 - Select recipe measures and weights</Header>
              <Segment attached>
                <UnitsOfMeasure
                  formState={formState}
                  register={register}
                  onUomType={handleUomType}
                  onSetWeight={handleDimensionWeight}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <Header block attached="top">3 - Amount of water in recipe</Header>
              <Segment attached>
                <AmountOfWater register={register} />
              </Segment>
            </Grid.Column>

            <Grid.Column>
              <Header block attached="top">4 - Oil superfat</Header>
              <Segment attached>
                <OilSuperfat formState={formState} register={register} />
              </Segment>

              <Header block attached="top">5 - Fragrances</Header>
              <Segment attached>
                <Fragrances formState={formState} register={register} />
              </Segment>
            </Grid.Column>
          </Grid.Row>

          {currentUser && (
            <Grid.Row columns={2}>
              <Grid.Column width={8}>
                <Header block attached="top">6 - Select Additives</Header>
                <Segment attached>
                  <ListAdditivesSelector
                    additives={additives}
                    onAddedAdditive={addAdditiveToRecipe}
                    onRefresh={refetchAdditives}
                  />
                </Segment>
              </Grid.Column>

              <Grid.Column width={8}>
                <Header block attached="top">Recipe Additives</Header>
                <Segment attached data-cy="list-additives-weights-segment">
                  <ListAdditivesRecipe
                    recipe={summary}
                    formState={formState}
                    register={register}
                    onRemove={removeAdditiveFromRecipe}
                  />
                  <ErrorMessage message name="additives" register={register} />
                </Segment>

                <Header block attached="top">Additives Calculation Tweaks</Header>
                <Segment attached data-cy="additives-tweaks">
                  <AdditivesCalculationTweaks
                    formState={formState}
                    register={register}
                  />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          )}

          {!(currentUser) && (
            <Grid.Row columns={2}>
              <Grid.Column width={8}>
                <Header block attached="top">6 - Select Additives</Header>
                <LoginToCreatePostCTA
                  cta="create and manage your list of Soap Additives"
                  data-cy="login-for-additives"
                />
              </Grid.Column>

              <Grid.Column width={8}>
                <Header block attached="top">Additives Calculation Tweaks</Header>
                <Segment attached data-cy="additives-tweaks">
                  <AdditivesCalculationTweaks
                    formState={formState}
                    register={register}
                  />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          )}

          <Grid.Row columns={2}>
            <Grid.Column width={8}>
              <Header block attached="top">7 - Select Oils</Header>
              <Segment attached>
                <ListOilsSelector
                  oils={oils}
                  onAddedOil={useCallback(addOilToRecipe, [])}
                />
              </Segment>
            </Grid.Column>

            <Grid.Column width={8}>
              <Header block attached="top">Recipe Oils</Header>
              <Segment attached data-cy="list-oil-weights-segment">
                <ListOilsRecipe
                  recipe={summary}
                  formState={formState}
                  register={register}
                  onRemove={removeOilFromRecipe}
                />
                <ErrorMessage always message name="oils" register={register} />
              </Segment>
            </Grid.Column>
          </Grid.Row>

          {_.get(formState, 'oils.length') > 0 && (
            <Grid.Row columns={1}>
              <Grid.Column>
                <Header block attached="top">Recipe</Header>
                <OilBreakdown attached recipe={summary} />
              </Grid.Column>
            </Grid.Row>
          )}

          {_.get(formState, 'additives.length') > 0 && (
            <Grid.Row columns={1}>
              <Grid.Column>
                <Header block attached="top">Additives</Header>
                <AdditiveBreakdown attached recipeAdditives={formState.additives} />
              </Grid.Column>
            </Grid.Row>
          )}

          {summary.display.countWeights > 0 && (
            <>
              <Grid.Row columns={3}>
                <Grid.Column width={8}>
                  <Header block attached="top">Recipe Totals</Header>
                  <RecipeTotals attached recipe={summary} />
                </Grid.Column>

                <Grid.Column width={5}>
                  <Header block attached="top">Recipe Properties</Header>
                  <RecipeProperties
                    attached
                    withRange
                    showTooltips
                    recipe={summary}
                  />
                </Grid.Column>

                <Grid.Column width={3}>
                  <Header block attached="top">Fatty Acids %</Header>
                  <RecipeFattyAcids
                    attached
                    showTooltips
                    recipe={summary}
                  />
                </Grid.Column>
              </Grid.Row>

              <RowColumn>
                <Header>Want to save your Recipe?</Header>
                <Description register={register} />
              </RowColumn>

              <RowColumn>
                <Header>Recipe Image</Header>
                <RecipeImage recipe={recipe} onSetImage={handleSetImage} />
              </RowColumn>

              <RowColumn>
                <Header>Recipe Visibility</Header>
                <Visibility register={register} />
              </RowColumn>

              <RowColumn>
                <ErrorsSummary
                  header="Could not save recipe. Please review the following errors:"
                  errors={errors}
                />
              </RowColumn>

              <RowColumn>
                <Buttons
                  errors={errors}
                  submitting={submitting}
                  saveAction={saveAction}
                  resetForm={resetForm}
                  canSaveAsCopy={canSaveAsCopy}
                  onSaveCopy={handleSaveCopyButton}
                  onSubmit={submitForm}
                  onPrint={handlePrint}
                  onPrintPreview={handlePrintPreview}
                />
              </RowColumn>
            </>
          )}
        </Grid>
      </Form>
    </Section>
  );

  //

  function handleSaveCopyButton() {
    return submitForm(handleSaveCopy);
  }

  function handleUomType(uomType) {
    setFormValues(prev => ({
      ...prev,
      uomType
    }));
  }

  function handleDimensionWeight(totalWeight) {
    setFormValues(prev => ({
      ...prev,
      totalWeight,
      uom: prev.uomType === 'dimensions' ? 'percent' : prev.uom,
      totalsIncludeWater: true
    }));
  }

  function handleFormSubmit(values) {
    const converted = validationSchema.cast(values);

    analyticsEvent({ category: 'Recipes', action: `${saveAction}Recipe` });

    return Bluebird.try(() => {
      const recipePayload = formValuesToRecipePayload(converted, oils);

      return Bluebird
        .resolve(onSave(recipePayload));
    });
  }

  function handleSaveCopy(values) {
    const converted = validationSchema.cast(values);

    analyticsEvent({ category: 'Recipes', action: 'saveAsCopy' });

    return Bluebird.try(() => {
      const recipePayload = formValuesToRecipePayload(converted, oils);

      return Bluebird
        .resolve(onSaveAsCopy(recipePayload));
    });
  }

  function handlePrint() {
    const printRecipe = formValuesToPrint();

    onPrint(printRecipe);
  }

  function handlePrintPreview() {
    const printRecipe = formValuesToPrint();

    onPrint(printRecipe, { preview: true });
  }

  function handleSetImage({ recipeImage, recipeImageSizeData }) {
    setImageData({ recipeImage, recipeImageSizeData });
  }

  function recipeToFormPayload() {
    if (recipe) {
      return {
        ...(_.omit(recipe, ['settings', 'recipeOils'])),
        // set null values to undefined so that yup can set these to the default value
        ...(_.mapValues(recipe.settings, value => (_.isNull(value) ? undefined : value))),
        // additives shape
        additives: _.map(recipe.recipeAdditives, ({ additiveId, weight, additive }) => ({
          id: additiveId,
          name: additive.name,
          weight
        })),
        // oils shape
        oils: _.map(recipe.recipeOils, ({ oilId, weight, oil }) => ({
          id: oilId,
          name: oil.name,
          weight
        }))
      };
    } else {
      return validationSchema.default();
    }
  }

  function formValuesToRecipePayload(formValues, oilsInput) {
    // eslint-disable-next-line no-unused-vars
    const { display, ...rest } = recipeSummary(formValues, oilsInput);
    const { name, description, notes, visibility, oils: recipeOils, additives: recipeAddtives, ...settings } = formValues;
    const { recipeImage, recipeImageSizeData } = imageData;

    const additivesToSave = _.map(recipeAddtives, ({ id, weight }) => ({ id, weight }));
    const oilsToSave = _.map(recipeOils, ({ id, weight }) => ({ id, weight }));

    return {
      name,
      description,
      notes,
      summary: rest,
      visibility,
      settings: {
        ...settings,
        additives: additivesToSave,
        oils: oilsToSave
      },
      recipeImage,
      recipeImageSizeData
    };
  }

  function formValuesToPrint() {
    const { name, description, notes, visibility, ...settings } = formState;

    return {
      name,
      description,
      notes,
      visibility,
      settings,
      recipeAdditives: _.map(formState.additives, additive => ({ additiveId: additive.id, weight: additive.weight, additive })),
      recipeOils: _.map(formState.oils, oil => ({ oilId: oil.id, weight: oil.weight, oil }))
    };
  }

  function addOilToRecipe(oil) {
    setFormValues((prevState) => {
      const exists = _.find(prevState.oils, { id: String(oil.id) });

      if (!(exists)) {
        return {
          oils: [...(prevState.oils || []), { ...oil, weight: null }]
        };
      } else {
        return prevState;
      }
    });
  }

  function addAdditiveToRecipe(additive) {
    setFormValues((prevState) => {
      const exists = _.find(prevState.additives, { id: String(additive.id) });

      if (!(exists)) {
        return {
          additives: [...(prevState.additives || []), { ...additive, weight: null }]
        };
      } else {
        return prevState;
      }
    });
  }

  function removeOilFromRecipe(index) {
    const oil = formState.oils[index];

    if (oil) {
      setFormValues(prevState => ({
        oils: _.reject(prevState.oils, { id: oil.id })
      }));
    }
  }

  function removeAdditiveFromRecipe(index) {
    const additive = formState.additives[index];

    if (additive) {
      setFormValues(prevState => ({
        additives: _.reject(prevState.additives, { id: additive.id })
      }));
    }
  }

  function formValuesForUseMemo() {
    return _.omit(formState, ['name', 'description', 'notes', 'visibility']);
  }
}

function RowColumn({ children }) {
  return (
    <Grid.Row columns={1}>
      <Grid.Column>
        {children}
      </Grid.Column>
    </Grid.Row>
  );
}

SoapCalculator.defaultProps = {
  canSaveAsCopy: false,
  oils: null,
  recipe: null,
  saveAction: 'Save',
  onSaveAsCopy: noop
};

SoapCalculator.propTypes = {
  recipe: PropTypes.object,
  oils: PropTypes.array,
  saveAction: PropTypes.string,
  canSaveAsCopy: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onSaveAsCopy: PropTypes.func,
  onPrint: PropTypes.func.isRequired
};

RowColumn.propTypes = {
  children: PropTypes.array.isRequired
};

const validationSchema = yup.object({
  name: yup.string().min(3).max(100).default('')
    .label('Recipe name'),
  description: yup.string().default('').nullable(),
  notes: yup.string().default('').nullable(),

  additives: yup.array().of(
    yup.object({
      id: yup.number().required(),
      name: yup.string(),
      weight: yup.string().ensure().nullable()
    })
  ),

  oils: yup.array().of(
    yup.object({
      id: yup.string().required(),
      name: yup.string(),
      weight: yup.number().default(0).required().typeError('Oil weight is not a number')
    })
  )
    .default([])
    .min(1, 'At least one Oil is required')
    .test('full-ratio-weights', 'Oil ratios must equal 100%', function(value) {
      if (this.parent.uom === 'percent' && !(_.isEmpty(this.parent.oils))) {
        const sumRatios = _.sumBy(value, 'weight');

        return Math.abs(100 - sumRatios) <= 0.09;
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
    }),

  soapType: yup.string().default('naoh'),
  ratioNaoh: yup.number().min(0).max(100).default(50),
  ratioKoh: yup.number().min(0).max(100).default(50),
  kohPurity: yup.number().min(0).max(100).default(90),
  naohPurity: yup.number().min(0).max(100).default(100),
  uom: yup.string().default('percent'),
  uomType: yup.string().default('weights'),
  uomDimensionType: yup.string().default('box'),
  dimensionWidth: yup.number().min(0),
  dimensionHeight: yup.number().min(0),
  dimensionLength: yup.number().min(0),
  dimensionDiameter: yup.number().min(0),
  totalWeight: yup.number().min(0).default(500),
  totalUom: yup.string().default('gram'),
  superFat: yup.number().typeError('Must be a valid number').min(-10).max(100).default(5).label('Super fat'),
  waterRatio: yup.number().min(0).default(38),
  recipeLyeConcentration: yup.number().min(0).default(30),

  totalsIncludeWater: yup.boolean().default(false),
  superfatAfter: yup.boolean().default(false),

  lyeCalcType: yup.string().default('ratio'),
  lyeWaterLyeRatio: yup.number().min(0).default(1),
  lyeWaterWaterRatio: yup.number().min(0).default(3),
  waterDiscount: yup.number().min(0).default(0),

  fragrance: yup.number().min(0).default(3),
  fragranceType: yup.string().default('ratio'),
  fragrancePpo: yup.number().min(0).default(30),

  enableCitricAdjust: yup.boolean().default(false),
  citricAdjustPercent: yup.number().min(0).default(1),

  visibility: yup.number().default(0)
});
