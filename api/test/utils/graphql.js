import _ from 'lodash';

export default function responseHandler(res, fn) {
  if (_.isEmpty(res.body.errors)) {
    return fn();
  } else {
    const errors = _.map(res.body.errors, 'message').join('\n');

    // console.log('res.body', util.inspect(res, { depth: 10 }));

    throw new Error(errors);
  }
}
