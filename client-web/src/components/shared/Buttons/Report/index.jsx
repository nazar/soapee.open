import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { Button, Modal, Header, Form } from 'semantic-ui-react';
import * as yup from 'yup';

import client from 'client';

import { useForm, BitFieldCheckboxGroup, TextArea, ErrorMessage } from 'components/shared/Form';
import GAEventReporter from 'components/shared/GAEventReporter';

import reportMutation from './reportReportable.gql';


export default function Report({ reportable, reportableType, onReported }) {
  const [open, setOpen] = useState(false);
  const myReport = _.get(reportable, 'myReport') || {};
  const isReported = _.has(myReport, 'id');

  const { register, submitForm, submitting } = useForm({
    validation: validationSchema,
    onSubmit: handleSubmit
  });

  return (
    <span className="button-report">
      <Modal
        open={open}
        centered={false}
        onClose={handleClose}
        data-cy="report-content-modal"
        trigger={(
          <ReportButton
            isReported={isReported}
            reportable={reportable}
            reportableType={reportableType}
            onClick={handleOpen}
          />
        )}
      >
        <Modal.Header>Report Content</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Header>Please select the options that best apply:</Header>
            <Form onSubmit={submitForm}>
              <Form.Field>
                <BitFieldCheckboxGroup name="report" bitFields={fields} register={register} />
              </Form.Field>

              <Form.Field>
                <TextArea name="notes" register={register} />
                <ErrorMessage name="notes" register={register} />
              </Form.Field>

              {isReported && (
                <Button negative loading={submitting}>Delete Report</Button>
              )}

              {!(isReported) && (
                <Button primary loading={submitting}>Submit Report</Button>
              )}

              <Button onClick={cancel} loading={submitting}>Cancel</Button>
            </Form>

          </Modal.Description>
        </Modal.Content>
      </Modal>
    </span>
  );

  function cancel() {
    setOpen(false);
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleSubmit(values) {
    const { report, notes } = values;

    return Bluebird.resolve(client
      .mutate({
        mutation: reportMutation,
        variables: {
          input: {
            reportableId: reportable.id,
            reportableType,
            report,
            notes
          }
        }
      }))
      .then(({ data: { reportReportable } }) => reportReportable)
      .then((reportReportable) => {
        onReported(reportReportable);
        setOpen(false);
      });
  }
}

Report.propTypes = {
  reportable: PropTypes.object.isRequired,
  reportableType: PropTypes.string.isRequired,
  onReported: PropTypes.func.isRequired
};

function ReportButton({ isReported, reportable, reportableType, ...rest }) {
  const caption = isReported ? 'Reported' : 'Report';

  return (
    <GAEventReporter
      category="Polymorphic"
      action="report"
      label={reportableType}
      value={Number(reportable.id)}
    >
      <Button
        active={isReported}
        size="mini"
        data-cy="report-button"
        {...rest}
      >
        {caption}
      </Button>
    </GAEventReporter>
  );
}

ReportButton.defaultProps = {
  isReported: false
};

ReportButton.propTypes = {
  isReported: PropTypes.bool,
  reportable: PropTypes.object.isRequired,
  reportableType: PropTypes.string.isRequired
};

const fields = [
  { label: 'Abusive', bit: 1 },
  { label: 'Explicit Content', bit: 2 },
  { label: 'Adult Content - not family friendly', bit: 3 },
  { label: 'Rude or Aggressive behaviour', bit: 4 },
  { label: 'Politics', bit: 5 },
  { label: 'Religion', bit: 6 },
  { label: 'Spam', bit: 7 },
  { label: 'Other', bit: 30 }
];

const validationSchema = yup.object({
  report: yup.number().default(0),
  notes: yup.string().default('')
});
