import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'semantic-ui-react';
import { format, parse, differenceInSeconds, distanceInWordsToNow } from 'date-fns';
import cx from 'clsx';

import './timeAgo.styl';

export default function TimeAgo({ date, render, plain, 'data-cy': dataCy }) {
  if (date) {
    return <TimeAgoHasDate date={date} render={render} plain={plain} dataCy={dataCy} />;
  } else {
    return null;
  }
}

function TimeAgoHasDate({ date, render, plain, dataCy }) {
  const parsedDate = parse(date);

  const [timeWords, setTimeWords] = useState(distanceInWordsToNow(parsedDate));

  useEffect(() => {
    const waitSeconds = getTimeoutWait(date);

    const interval = setInterval(() => {
      setTimeWords(distanceInWordsToNow(parsedDate));
    }, waitSeconds * 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // render

  if (_.isFunction(render)) {
    return (
      <TimeAgoContainer
        parsedDate={parsedDate}
        plain={plain}
        dataCy={dataCy}
      >
        {render(timeWords)}
      </TimeAgoContainer>
    );
  } else {
    return <TimeAgoContainer parsedDate={parsedDate} plain={plain} dataCy={dataCy}>{timeWords} ago</TimeAgoContainer>;
  }
}

function TimeAgoContainer({ children, parsedDate, plain, dataCy }) {
  return (
    <Popup
      trigger={<span className={cx('time-ago', { plain })} data-cy={dataCy}>{children}</span>}
      content={format(parsedDate, 'Do MMMM YYYY h:mm a')}
    />
  );
}

TimeAgoContainer.defaultProps = {
  plain: false,
  dataCy: null
};

TimeAgoContainer.propTypes = {
  children: PropTypes.array.isRequired,
  parsedDate: PropTypes.number.isRequired,
  plain: PropTypes.bool,
  dataCy: PropTypes.string
};

export function updatedAgo(date) {
  return (
    <span> - updated {date} ago</span>
  );
}

function getTimeoutWait(date) {
  const parsedDate = parse(date);
  const diffSeconds = differenceInSeconds(new Date(), parsedDate);

  // if diffSeconds is small then we want to update the timer more frequently
  let waitSeconds;

  if (diffSeconds < 60) {
    waitSeconds = 0;
  } else if (diffSeconds < 60 * 60) {
    waitSeconds = 60;
  } else {
    waitSeconds = 60 * 60;
  }

  return waitSeconds;
}
