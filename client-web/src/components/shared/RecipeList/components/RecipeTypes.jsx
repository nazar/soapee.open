import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Form, Checkbox as SemanticCheckbox } from 'semantic-ui-react';


export default function RecipeTypes({ formState, setFormValues }) {
  const { soapTypes } = formState;

  return (
    <Grid columns="equal" stackable>
      <Grid.Row>
        <Grid.Column>
          <Form.Field
            value="naoh"
            checked={_.includes(soapTypes, 'naoh')}
            label={<label><strong>NaOH</strong> (Sodium Hydroxide)</label>}
            control={SemanticCheckbox}
            onChange={handleChange}
          />
        </Grid.Column>

        <Grid.Column>
          <Form.Field
            value="koh"
            checked={_.includes(soapTypes, 'koh')}
            label={<label><strong>KOH</strong> (Potassium Hydroxide)</label>}
            control={SemanticCheckbox}
            onChange={handleChange}
          />
        </Grid.Column>

        <Grid.Column>
          <Form.Field
            value="mixed"
            checked={_.includes(soapTypes, 'mixed')}
            label={<label>both <strong>KOH</strong> and <strong>NaOH</strong></label>}
            control={SemanticCheckbox}
            onChange={handleChange}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );

  function handleChange(e, { value, checked }) {
    if (checked) {
      setFormValues(prev => ({
        soapTypes: [...prev.soapTypes, value]
      }));
    } else {
      setFormValues(prev => ({
        soapTypes: _.without(prev.soapTypes, value)
      }));
    }
  }
}

RecipeTypes.propTypes = {
  formState: PropTypes.object.isRequired,
  setFormValues: PropTypes.func.isRequired
};
