import Bluebird from 'bluebird';
import { UniqueViolationError } from 'objection';

import Additive from 'models/additive';

import sanitiseHtml from 'services/sanitiseHtml';
import { UserInputError } from 'services/errors';

export default function createAdditive({ input, user }) {
  const notes = input.notes ? sanitiseHtml(input.notes) : undefined;

  return Bluebird
    .resolve(
      Additive
        .query()
        .insertAndFetch({
          name: input.name,
          notes,
          userId: user.id
        })
    )
    .catch(UniqueViolationError, () => {
      throw new UserInputError(`${input.name} already exists`, { code: 'additive_exists' });
    });
}
