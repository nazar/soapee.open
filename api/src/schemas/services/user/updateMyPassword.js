import bcrypt from 'bcrypt';

import Verification from 'models/verification';
import { UserInputError } from 'services/errors';

export default async function updateMyPassword({ user, input: { currentPassword, newPassword } }) {
  const verification = await Verification.query().where({ userId: user.id }).limit(1).first();

  if (verification.providerName === 'local') {
    const currentMatches = await bcrypt.compare(currentPassword, verification.hash);

    if (currentMatches) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      return Verification
        .query()
        .update({
          hash
        })
        .where({ id: verification.id })
        .returning('*')
        .first();
    } else {
      throw new UserInputError('Password mismatch', { code: 'password_mismatch' });
    }
  } else {
    throw new UserInputError('Not a local user', { code: 'not_local_user' });
  }
}
