import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Verification from 'models/verification';
import User from 'models/user';

export default function deleteMyAccount({ user }) {
  if (!(user?.id)) {
    throw new Error('User is missing');
  } else {
    let trx;

    return Bluebird
      .try(async () => {
        trx = await transaction.start(User.knex());

        return User
          .query(trx)
          .patch({
            name: 'deleted',
            imageUrl: null,
            about: null,
            email: null,
            deletedAt: 'now()'
          })
          .where({
            id: user.id
          })
          .then(() => {
            return Verification
              .query(trx)
              .patch({
                hash: null,
                deletedAt: 'now()'
              })
              .where({
                userId: user.id
              });
          })
          .then(() => true);
      })
      .tap(() => trx.commit())
      .tapCatch(() => trx.rollback());
  }
}
