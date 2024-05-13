import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Bluebird from 'bluebird';
import { useQuery } from '@apollo/client';
import { Button, Container, Divider, Form, Grid, Message, Segment } from 'semantic-ui-react';

import client from 'client';
import { createdAtAndUpdatedAtDiffer } from 'services/time';

import Placeholder from 'components/shared/Placeholder';
import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import RichEditor from 'components/shared/RichEditor';
import Section from 'components/shared/Section';
import GAEventReporter from 'components/shared/GAEventReporter';
import SubTitle from 'components/shared/SubTitle';
import TimeAgo, { updatedAgo } from 'components/shared/TimeAgo';

import recipeJournalsQuery from './queries/recipeJournals.gql';
import createRecipeJournalMutation from './queries/createRecipeJournal.gql';
import updateRecipeJournalMutation from './queries/updateRecipeJournal.gql';


export default function RecipeJournals({ recipeId, canAddJournal }) {
  const { loading, data: { recipeJournals } = {}, error, updateQuery } = useQuery(recipeJournalsQuery, {
    variables: { search: { recipeId } }
  });

  const editor = React.createRef();

  if (loading) {
    return (
      <Container>
        <Placeholder lines={10} />
      </Container>
    );
  } else if (_.isEmpty(error)) {
    return (
      <div className="recipe-journals" data-cy="recipe-journals">
        {_.isEmpty(recipeJournals) && (
          <Message info>
            <Message.Header>No Recipe Journals Yet</Message.Header>
            <p>
              Recipe Journals can be used to post status updates or notes on how the recipe has worked out i.e. how does
              the soap bar perform after curing?
            </p>
          </Message>
        )}

        <RenderRecipeJournals
          recipeJournals={recipeJournals}
          canEditJournal={canAddJournal}
          onUpdateRecipeJournal={handleUpdateRecipeJournal}
        />

        {canAddJournal && (
          <Segment>
            <CreateRecipeJournal
              editor={editor}
              onAddedJournal={handleAddedJournal}
            />
          </Segment>
        )}
      </div>
    );
  } else {
    return (
      <Message negative>
        <p>There was an error loading Journals for this Recipe.</p>
        <p>The error was logged and Soapee was notified.</p>
      </Message>
    );
  }

  //

  function handleAddedJournal(journalEntry) {
    return Bluebird.resolve(
      client.mutate({
        mutation: createRecipeJournalMutation,
        variables: {
          input: {
            recipeId,
            journal: journalEntry
          }
        }
      }))
      .then(({ data: { createRecipeJournal } }) => createRecipeJournal)
      .then(newJournalEntry => updateQuery(prev => ({
        recipeJournals: [
          newJournalEntry,
          ...(prev.recipeJournals || [])
        ]
      })));
  }

  function handleUpdateRecipeJournal(recipeJournal, updatedEntry) {
    return Bluebird.resolve(
      client.mutate({
        mutation: updateRecipeJournalMutation,
        variables: {
          id: recipeJournal.id,
          input: {
            journal: updatedEntry
          }
        }
      }));
  }
}

function RenderRecipeJournals({ recipeJournals, canEditJournal, onUpdateRecipeJournal }) {
  return _.map(recipeJournals, recipeJournal => (
    <Segment className="recipe-journal" data-cy="recipe-journal" key={recipeJournal.id}>
      <RenderRecipeJournal
        recipeJournal={recipeJournal}
        canEditJournal={canEditJournal}
        onUpdateRecipeJournal={onUpdateRecipeJournal}
      />
    </Segment>
  ));
}

function RenderRecipeJournal({ recipeJournal, canEditJournal, onUpdateRecipeJournal }) {
  const [readOnly, setReadOnly] = useState(true);
  const editor = React.createRef();

  return (
    <Section className="content">
      <SubTitle>
        Journal Update added &nbsp;
        <TimeAgo date={recipeJournal.createdAt} />

        {createdAtAndUpdatedAtDiffer(recipeJournal) && (
          <TimeAgo
            date={recipeJournal.updatedAt}
            render={updatedAgo}
          />
        )}
      </SubTitle>

      <Divider />

      <PostImageLinkMessage visible={!(readOnly)} />
      <RichEditor
        id={`recipe-journal-${recipeJournal.id}`}
        message={recipeJournal.journal}
        ref={editor}
        readOnly={readOnly}
      />

      {canEditJournal && <Divider />}

      <RecipeJournalFooter
        canEditJournal={canEditJournal}
        editing={!(readOnly)}
        onSetReadOnly={setReadOnly}
        onUpdateRecipeJournal={handleCommentUpdate}
      />
    </Section>
  );

  //

  function handleCommentUpdate() {
    const newJournalEntry = editor.current.getEditorMessage();

    return Bluebird
      .resolve(onUpdateRecipeJournal(recipeJournal, newJournalEntry))
      .finally(() => setReadOnly(true));
  }
}

RenderRecipeJournal.defaultProps = {
  canEditJournal: false
};

RenderRecipeJournal.propTypes = {
  recipeJournal: PropTypes.object.isRequired,
  canEditJournal: PropTypes.bool,
  onUpdateRecipeJournal: PropTypes.func.isRequired
};

function RecipeJournalFooter({ canEditJournal, editing, onSetReadOnly, onUpdateRecipeJournal }) {
  return (
    <div className="footer">
      <Grid>
        <Grid.Row>
          <Grid.Column width={16} textAlign="right">
            {canEditJournal && !(editing) && (
              <GAEventReporter
                category="Recipes"
                action="editRecipeJournal"
              >
                <Button
                  size="mini"
                  onClick={handleEditClick}
                  data-cy="edit-journal"
                >
                  Edit
                </Button>
              </GAEventReporter>
            )}

            {editing && (
              <>
                <GAEventReporter
                  category="Recipes"
                  action="cancelEditRecipeJournal"
                >
                  <Button
                    secondary
                    size="mini"
                    onClick={handleCancelClick}
                    data-cy="cancel-edit-journal"
                  >
                    Cancel
                  </Button>
                </GAEventReporter>

                <RecipeJournalFooterUpdateButton
                  onUpdateRecipeJournal={onUpdateRecipeJournal}
                />
              </>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );

  //

  function handleEditClick() {
    onSetReadOnly(false);
  }

  function handleCancelClick() {
    onSetReadOnly(true);
  }
}

RecipeJournalFooter.defaultProps = {
  canEditJournal: false,
  editing: false
};

RecipeJournalFooter.propTypes = {
  canEditJournal: PropTypes.bool,
  editing: PropTypes.bool,
  onSetReadOnly: PropTypes.func.isRequired,
  onUpdateRecipeJournal: PropTypes.func.isRequired
};

function RecipeJournalFooterUpdateButton({ onUpdateRecipeJournal }) {
  const [updating, setUpdating] = useState();

  return (
    <GAEventReporter
      category="Recipes"
      action="updateRecipeJournal"
    >
      <Button
        primary
        size="mini"
        loading={updating}
        onClick={handleUpdateClick}
        data-cy="update-journal"
      >
        Update
      </Button>
    </GAEventReporter>
  );

  //

  function handleUpdateClick() {
    setUpdating(true);

    return Bluebird
      .resolve(onUpdateRecipeJournal())
      .finally(() => setUpdating(false));
  }
}

RecipeJournalFooterUpdateButton.propTypes = {
  onUpdateRecipeJournal: PropTypes.func.isRequired
};

function CreateRecipeJournal({ onAddedJournal, editor }) {
  const [hasContent, setHasContent] = useState();
  const [saving, setSaving] = useState();

  return (
    <div className="create-recipe-journal" data-cy="create-recipe-journal">
      <Form>
        <Form.Field>
          <PostImageLinkMessage visible />
          <RichEditor
            id="create-recipe-journal"
            ref={editor}
            placeholder="Add your journal entry..."
            onChange={handleOnChange}
          />
        </Form.Field>

        <Button
          primary
          loading={saving}
          onClick={handleAddContent}
          disabled={!(hasContent)}
        >
          Create Journal Entry
        </Button>
      </Form>
    </div>
  );

  function handleOnChange(data) {
    if (data.hasContent !== hasContent) {
      setHasContent(data.hasContent);
    }
  }

  function handleAddContent() {
    if (hasContent) {
      const commentContent = editor.current.getEditorMessage();

      setSaving(true);

      return Bluebird
        .resolve(onAddedJournal(commentContent))
        .then(() => editor.current.clear())
        .finally(() => setSaving(false));
    }
  }
}

CreateRecipeJournal.propTypes = {
  editor: PropTypes.object.isRequired,
  onAddedJournal: PropTypes.func.isRequired
};
