import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

export default function GAEventReporter({ children, category, action, label, value, event = 'onClick' }) {
  if (_.isArray(children)) {
    throw new Error('Cannot be used on an array of children');
  } else {
    const childEvent = children.props[event];

    return React.cloneElement(children, {
      [event]: (e) => {
        analyticsEvent({ category, action, label, value });

        return _.isFunction(childEvent) && childEvent(e);
      }
    });
  }
}

GAEventReporter.propTypes = {
  children: PropTypes.element.isRequired,
  category: PropTypes.string.isRequired,
  event: PropTypes.oneOf(['onClick', 'onChange', 'onBlur', 'onSubmit']),
  label: PropTypes.string,
  value: PropTypes.number
};

export function analyticsEvent({ category, action, label, value }) {
  if (_.has(window, 'gtag')) {
    const eventPayload = {
      event_category: category,
      event_label: label,
      value
    };

    window.gtag('event', action, eventPayload);
  }
}
