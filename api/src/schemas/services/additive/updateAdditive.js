import _ from 'lodash';
import Bluebird from 'bluebird';
import { UniqueViolationError } from 'objection';

import Additive from 'models/additive';
import sanitiseHtml from 'services/sanitiseHtml';
import { UserInputError } from 'services/errors';

export default function updateAdditive({ id, input, user }) {
  return Bluebird
    .resolve()
    .then(getAdditiveAndCheckItIsMine)
    .then(updateAdditive)
    .catch(UniqueViolationError, () => {
      throw new UserInputError(`${input.name} already exists`, { code: 'additive_exists' });
    });

  //

  function getAdditiveAndCheckItIsMine() {
    return Additive
      .query()
      .findOne({ id, userId: user.id })
      .then((res) => {
        if (_.isEmpty(res)) {
          throw new UserInputError('Additive not found or is not mine', { id, user });
        }
      });
  }

  function updateAdditive() {
    const notes = input.notes ? sanitiseHtml(input.notes) : undefined;

    return Additive
      .query()
      .patchAndFetchById(id, {
        name: input.name,
        notes
      });
  }
}
