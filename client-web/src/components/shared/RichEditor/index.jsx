/* eslint-disable */

import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

import './RichEditor.styl';

export default class RichTextDisplay extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    customButtons: PropTypes.array,
    customStyles: PropTypes.array,
    message: PropTypes.string,
    placeholder: PropTypes.string,
    readOnly: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func
  };

  static defaultProps = {
    placeholder: '',
    onChange: () => {},
    onBlur: () => {}
  };

  state = {
    message: null
  };

  editor = React.createRef();

  messageContent = null;

  componentDidMount() {
    const { message } = this.props;

    this.setState({ message });
  }

  componentDidUpdate() {
    const { message } = this.props;

    // eslint-disable-next-line react/destructuring-assignment
    if (message && (message !== this.state.message)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ message });
    }
  }

  render() {
    const { id, message, customButtons, customStyles, readOnly, placeholder } = this.props;

    const displayComponent = readOnly
      ? <RenderMessage message={message} />
      : (
        <RichTextDisplayEditor
          id={id}
          ref={this.editor}
          message={message}
          customButtons={customButtons}
          customStyles={customStyles}
          placeholder={placeholder}
          onChange={this._handleOnChange}
          onBlur={this._handleOnBlur}
        />
      );

    return (
      <div className="rich-text-display">
        {displayComponent}
      </div>
    );
  }

  clear() {
    this.editor.current.clear();
  }

  getEditorMessage() {
    return this.messageContent;
  }

  addQuoteBlock(messageObject, messageKey = 'message') {
    const content = messageObject[messageKey];
    const quote = `<blockquote>${content}</blockquote>`;

    this.editor.current.insertHtml(quote);
    setTimeout(() => this.editor.current.insertCursorPlaceholderAtEnd());
  }

  // private methods

  _handleOnChange = (meta) => {
    const { onChange } = this.props;

    onChange({
      hasContent: meta.wordCount > 0,
      content: meta.content
    });

    this.messageContent = meta.content;
  };

  _handleOnBlur = () => {
    const { onBlur } = this.props;

    onBlur(this.messageContent);
  }
}

function RenderMessage({ message }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: message }}
      data-cy="rich-message"
    />
  );
}

class RichTextDisplayEditor extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    message: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func
  };

  static defaultProps = {
    id: undefined,
    message: '',
    onChange: () => {},
    onBlur: () => {}
  };

  render() {
    const { id } = this.props;

    return (
      <Editor
        id={id}
        init={this._initEditor()}
        onEditorChange={this._handleOnChange}
      />
    );
  }

  clear() {
    this.editor.setContent('');
  }

  insertHtml(html) {
    this.editor.insertContent(html);
  }

  insertCursorPlaceholderAtEnd() {
    // add an empty span with a unique id
    const spanId = _.uniqueId('editorEndPlaceholder');

    this.editor.dom.add(this.editor.getBody(), 'p', { id: spanId }, '&nbsp;');

    // select that span
    const newNode = this.editor.dom.select(`p#${spanId}`);

    this.editor.selection.select(newNode[0]);
    this.editor.selection.collapse(true);
  }

  _handleOnChange = (content) => {
    const { onChange } = this.props;

    onChange({
      content,
      wordCount: (content || '').length
    });
  };

  _handleInit = (editor) => {
    const { message, onBlur } = this.props;

    this.editor = editor;
    this.editor.setContent(message || '');

    editor.on('blur', onBlur);
  };

  _initEditor = () => {
    const { customStyles, placeholder } = this.props;
    const toolbarTemplate = 'bold italic underline | alignleft aligncenter alignright | formatselect styleselect | bullist numlist | outdent indent blockquote forecolor backcolor | undo redo | link image media'; //eslint-disable-line

    return {
      browser_spellcheck: true,
      menubar: false,
      branding: false,
      elementpath: false,
      theme: 'modern',
      end_container_on_empty_block: true,
      init_instance_callback: this._handleInit,
      // images_upload_handler: (blobInfo, success, failure) => {
      //   uploadImage(blobInfo.blob(), 'messageImage')
      //     .then((image) => {
      //       if (image) {
      //         success(image.imageUrl);
      //       }
      //     })
      //     .catch(failure);
      // },
      block_formats: 'Paragraph=p;Header=h2',
      plugins: [
        'link image lists colorpicker autoresize',
        'fullscreen media imagetools',
        'directionality textcolor colorpicker textpattern'
      ],
      toolbar: toolbarTemplate,
      style_formats: customStyles,
      content_css: ['/tinymce/editor.css'],
      relative_urls: false,
      convert_urls: false,
      paste_block_drop: false,
      media_alt_source: false,
      media_poster: false,
      media_dimensions: false,
      media_url_resolver: (data, resolve, reject) => {
        let videoLink;

        if ((data?.url || '').match('^https://www.youtube.com/embed/')) {
          videoLink = data.url;
        } else if ((data?.url || '').match('https://youtu.be/(.*)$')) {
          const [, videoId] = (data?.url || '').match('https://youtu.be/(.*)$');

          if (videoId) {
            videoLink = `https://www.youtube.com/embed/${videoId}`;
          } else {
            reject({ msg: 'Invalid https://youtu.be link' });
          }
        } else {
          reject({ msg: 'Only https://youtu.be/ or https://www.youtube.com/embed/ share links are supported' });
        }

        if (videoLink) {
          resolve({
            html: `<iframe width="560" height="315" src="${videoLink}"></iframe>`
          });
        }
      },
      placeholder
    };
  };
}
