import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.styl';

export default function PostImageLinkMessage({ visible }) {
  return visible && (
    <div className="post-image-link-message-component">
      Image uploads for posts and comments is still planned but meanwhile you can <Link to="/posts/55" target="_blank">upload</Link> images to
      services like <a href="https://postimages.org/" target="_blank" rel="noreferrer">postimages</a> and link them here
    </div>
  );
}

PostImageLinkMessage.defaultProps = {
  visible: false
};

PostImageLinkMessage.propTypes = {
  visible: PropTypes.bool
};
