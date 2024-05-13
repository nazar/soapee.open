import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Label, Input as InputSemantic, Table } from 'semantic-ui-react';
import { useKeyPress } from 'ahooks';

import useEventDataValue from 'hooks/useEventDataValue';
import useToggle from 'hooks/useToggle';

import Group from 'components/shared/Group';
import { ErrorMessage, Input, Select } from 'components/shared/Form';

import './style.styl';

export default function ForumTags({ register, formState, onAddTag, onDeleteTag }) {
  const [addTag, handleAddTag, setAddTag] = useEventDataValue('');

  return (
    <div className="forum-tags-component">
      <Form.Field>
        <Group className="add-tag-row">
          <InputSemantic
            value={addTag}
            maxLength="50"
            placeholder="Add a tag..."
            data-cy="add-forum-input"
            onChange={handleAddTag}
            onKeyPress={handleEnterKey}
          />
          <Button type="button" disabled={!(addTag)} onClick={handleAddTagEvent} data-cy="add-forum-button">Add Tag</Button>
        </Group>
      </Form.Field>
      <div>
        <Label>Forum Tags can be used to group, categorise or filter forum posts</Label>
      </div>

      {!(_.isEmpty(formState.forumTags)) && (
        <Table compact="very" size="small" className="tags-container" data-cy="forum-tags">
          <Table.Body>
            {_.map(formState.forumTags, (tag, index) => (
              <Table.Row key={index} data-cy="forum-tag-row">
                <Table.Cell>
                  <TagLabelEdit tag={tag} index={index} register={register} />
                </Table.Cell>

                <Table.Cell collapsing>
                  <Select
                    name={`forumTags[${index}.color]`}
                    options={colors}
                    placeholder="Select a color"
                    data-cy="select-color"
                    register={register}
                  />
                </Table.Cell>

                <Table.Cell collapsing>
                  <Button negative icon="close" type="button" size="mini" data-cy="remove-tag" onClick={handleDeleteTag(tag)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );

  function handleAddTagEvent() {
    onAddTag(addTag);
    setAddTag('');
  }

  function handleEnterKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      addTag && handleAddTagEvent();
    }
  }

  function handleDeleteTag(tag) {
    return () => onDeleteTag(tag);
  }
}

ForumTags.propTypes = {
  formState: PropTypes.object.isRequired,
  register: PropTypes.object.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onDeleteTag: PropTypes.func.isRequired
};

function TagLabelEdit({ tag, index, register }) {
  const [editing, toggleEditing, setEditing] = useToggle();

  useKeyPress('esc', ()=> setEditing());

  if (editing) {
    return (
      <Group className="tag-edit">
        <div>
          <Input required maxLength="50" name={`forumTags[${index}].tag`} data-cy="edit-tag" register={register} />
          <ErrorMessage name={`forumTags[${index}].tag`} register={register} />
        </div>

        <Button positive type="button" disabled={!(tag.tag.length)} size="mini" icon="check" onClick={toggleEditing} />
      </Group>
    );
  } else {
    return (
      <Label color={tag.color} className="can-click" onClick={toggleEditing}>{tag.tag}</Label>
    );
  }
}

const colors = [
  { key: 'black', value: 'black', text: 'Black' },
  { key: 'blue', value: 'blue', text: 'Blue' },
  { key: 'brown', value: 'brown', text: 'Brown' },
  { key: 'green', value: 'green', text: 'Green' },
  { key: 'grey', value: 'grey', text: 'Grey' },
  { key: 'olive', value: 'olive', text: 'Olive' },
  { key: 'orange', value: 'orange', text: 'Orange' },
  { key: 'pink', value: 'pink', text: 'Pink' },
  { key: 'purple', value: 'purple', text: 'Purple' },
  { key: 'red', value: 'red', text: 'Red' },
  { key: 'teal', value: 'teal', text: 'Teal' },
  { key: 'violet', value: 'violet', text: 'Violet' },
  { key: 'yellow', value: 'yellow', text: 'Yellow' }
];
