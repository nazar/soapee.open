import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'semantic-ui-react';
import cx from 'clsx';

import avatar from './avatar.png';
import './avatar.styl';

export default function Avatar({ user, size, ...rest }) {
  const [imageSrc, setImageSrc] = useState(user.canonicalImage);
  const semanticSize = size === 'micro' ? null : size;
  const micro = size === 'micro';

  useEffect(() => {
    user.canonicalImage && setImageSrc(user.canonicalImage);
  }, [user.canonicalImage]);

  return (
    <Image
      avatar
      src={imageSrc}
      size={semanticSize}
      className={cx('avatar-soapee', { micro })}
      onError={handle}
      {...rest}
    />
  );

  //

  function handle() {
    setImageSrc(avatar);
  }
}

Avatar.defaultProps = {
  size: null
};

Avatar.propTypes = {
  user: PropTypes.object.isRequired,
  size: PropTypes.string
};
