import bcrypt from 'bcrypt';
import * as yup from 'yup';

import Verification from 'models/verification';

export default async function convertFacebookAccountToLocalProvider({ input }) {
  const { token, username, newPassword } = await validateInputs();

  return Verification
    .query()
    .findOne({
      resetHash: token
    })
    .then(async (verification) => {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      return verification
        .$query()
        .patch({
          hash,
          resetHash: null,
          resetCode: null,
          providerId: username,
          providerName: 'local'
        })
        .returning('*');
    })
    .then(verification => verification.providerId);

  //

  function validateInputs() {
    return schema.validate(input);
  }
}

const schema = yup.object({
  username: yup
    .string()
    .min(3)
    .max(30)
    .matches(/^[a-zA-Z0-9_/-]*$/, { excludeEmptyString: true })
    .required(),
  newPassword: yup.string().min(3).max(30).required(),
  confirmPassword: yup.string().min(3).max(30).required()
    .test('match',
      'passwords do not match',
      function(value) {
        return value === this.parent.newPassword;
      }
    ),
  token: yup.string().required()
});
