import _ from 'lodash';

import Forum from 'models/forum';

export default function getForum({ id }) {
  return _.tap(Forum.query(), (query) => {
    if (isNaN(id)) { //eslint-disable-line
      query.where({ name: id }).limit(1).first();
    } else {
      query.findById(id);
    }
  });
}
