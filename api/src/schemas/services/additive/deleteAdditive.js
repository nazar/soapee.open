import _ from 'lodash';
import Bluebird from 'bluebird';

import Additive from 'models/additive';
import { UserInputError } from 'services/errors';

export default function deleteAdditive({ id, user }) {
  let additive;

  return Bluebird
    .resolve()
    .then(getAdditiveAndCheckItIsMine)
    .then(deleteAdditive)
    .then(() => additive);

  //

  function getAdditiveAndCheckItIsMine() {
    return Additive
      .query()
      .findOne({ id, userId: user.id })
      .then((res) => {
        if (_.isEmpty(res)) {
          throw new UserInputError('Additive not found or is not mine', { id, user });
        } else {
          additive = res;
        }
      });
  }

  function deleteAdditive() {
    return Additive
      .query()
      .deleteById(id);
  }
}
