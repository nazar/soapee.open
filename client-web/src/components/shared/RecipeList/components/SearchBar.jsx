import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, Icon, Form, Button } from 'semantic-ui-react';
import * as yup from 'yup';

import useOils from 'hooks/useOils';

import { useForm, Input, OilsMultiInput } from 'components/shared/Form';
import Section from 'components/shared/Section';
import GAEventReporter from 'components/shared/GAEventReporter';

import RecipeProperties from './RecipeProperties';
import RecipeTypes from './RecipeTypes';


const inputIcon = { name: 'search', circular: true };
const activePanelsEmptyState = [];

export default function SearchBar({ onSearch }) {
  const [activePanels, setActivePanels] = useState(activePanelsEmptyState);

  const { register, formState, setFormValues, submitForm, resetForm } = useForm({
    validation: validationSchema,
    onSubmit: doSubmit
  });


  return (
    <div className="search-bar">
      <Form onSubmit={submitForm}>
        <Input
          name="name"
          icon={inputIcon}
          placeholder="Search recipes..."
          autoComplete="off"
          register={register}
          data-cy="recipe-search"
        />

        <AdvancedSearch
          activePanels={activePanels}
          register={register}
          formState={formState}
          setFormValues={setFormValues}
          onCancel={handleReset}
          onPanel={handlePanel}
        />
      </Form>
    </div>
  );

  // handlers

  function doSubmit(values) {
    // filter out the properties values if untouched

    const properties = _(values)
      .chain()
      .get('properties')
      .reduce((result, settings, property) => {
        return _.tap(result, (r) => {
          if (_.includes(['iodine', 'ins'], property)) {
            if (settings.min > 0 || settings.max < 500) {
              r[property] = settings;
            }
          } else if (settings.min > 0 || settings.max < 100) {
            r[property] = settings;
          }
        });
      }, {})
      .value();

    const searchValues = {
      ...values,
      properties
    };

    return onSearch(searchValues);
  }

  function handlePanel(panel) {
    const enabled = _.includes(activePanels, panel);

    if (enabled) {
      setActivePanels(_.without(activePanels, panel));
    } else {
      setActivePanels([...activePanels, panel]);
    }
  }

  function handleReset() {
    resetForm();
    setActivePanels(activePanelsEmptyState);

    return onSearch({});
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
};

function AdvancedSearch({ activePanels, formState, setFormValues, register, onPanel, onCancel }) {
  const [oils] = useOils();

  return (
    <>
      <Accordion exclusive={false}>
        <Accordion.Title active={isActive(0)} onClick={toggle(0)}>
          <Icon name="dropdown" />
          <strong>Filter by Lye type</strong>
        </Accordion.Title>
        <Accordion.Content active={isActive(0)}>
          {isActive(0) && (
            <RecipeTypes
              formState={formState}
              setFormValues={setFormValues}
            />
          )}
        </Accordion.Content>

        <Accordion.Title active={isActive(1)} onClick={toggle(1)}>
          <Icon name="dropdown" />
          <strong>Filter by oils</strong>
        </Accordion.Title>
        <Accordion.Content active={isActive(1)}>
          {isActive(1) && (
            <OilsMultiInput
              placeholder="Filter recipes by oils..."
              name="oilIds"
              register={register}
              oils={oils}
            />
          )}
        </Accordion.Content>

        <Accordion.Title active={isActive(2)} onClick={toggle(2)}>
          <Icon name="dropdown" />
          <strong>Filter by properties</strong>
        </Accordion.Title>
        <Accordion.Content active={isActive(2)}>
          {isActive(2) && (
            <RecipeProperties
              formState={formState}
              register={register}
            />
          )}
        </Accordion.Content>
      </Accordion>

      <Section>
        <GAEventReporter
          category="Recipes"
          action="searchRecipes"
          label={formState?.name}
        >
          <Button primary type="submit">Search</Button>
        </GAEventReporter>

        <GAEventReporter
          category="Recipes"
          action="resetSearch"
        >
          <Button type="button" onClick={onCancel}>Reset</Button>
        </GAEventReporter>
      </Section>
    </>
  );

  //

  function isActive(panel) {
    return _.includes(activePanels, panel);
  }

  function toggle(panel) {
    return () => onPanel(panel);
  }
}

AdvancedSearch.defaultProps = {
  activePanels: activePanelsEmptyState
};

AdvancedSearch.propTypes = {
  activePanels: PropTypes.array,
  formState: PropTypes.object.isRequired,
  setFormValues: PropTypes.func.isRequired,
  register: PropTypes.object.isRequired,
  onPanel: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

const minMax = yup.object({
  min: yup.number().default(0),
  max: yup.number().default(500)
});

const minMaxPercent = yup.object({
  min: yup.number().default(0),
  max: yup.number().default(100)
});

const validationSchema = yup.object({
  name: yup.string().default(''),
  oilIds: yup.array(yup.number()).default([]),
  soapTypes: yup.array(yup.string()).default([]),
  properties: yup.object({
    bubbly: minMaxPercent,
    stable: minMaxPercent,
    hardness: minMaxPercent,
    cleansing: minMaxPercent,
    condition: minMaxPercent,
    ins: minMax,
    iodine: minMax
  })
});
