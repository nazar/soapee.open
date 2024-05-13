import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

import PostImageLinkMessage from 'components/shared/PostimageLinkMessage';
import RichEditor from 'components/shared/RichEditor';

function RichEdit({
  id,
  name,
  register,
  label,
  className,
  disabled,
  inline,
  required,
  ...rest
}, ref ) {
  const editorRef = useRef();

  useImperativeHandle(ref, () => ({
    clear: () => {
      editorRef.current.clear();
    }
  }));

  return (
    <Form.Field
      id={id}
      name={name}
      required={required}
      className={className}
      disabled={disabled}
      inline={inline}
    >
      {label && <label>{label}</label>}
      {label && <PostImageLinkMessage visible />}
      <RichEditor
        id={id}
        name={name}
        ref={editorRef}
        {...register.registerRichEdit(name)}
        {...rest}
      />
    </Form.Field>
  );
}

export default React.forwardRef(RichEdit);

RichEdit.defaultProps = {
  label: null,
  className: null,
  disabled: false,
  inline: false,
  required: false
};

RichEdit.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  register: PropTypes.object.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  inline: PropTypes.bool,
  required: PropTypes.bool
};
