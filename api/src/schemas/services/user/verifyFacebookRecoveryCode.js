import _ from 'lodash';
import * as yup from 'yup';

import Verification from 'models/verification';

export default async function verifyFacebookRecoveryCode({ input }) {
  const { code, token } = await validateInputs();

  return Verification
    .query()
    .findOne({
      resetCode: code,
      resetHash: token
    })
    .then(res => !(_.isEmpty(res)));

  //

  function validateInputs() {
    return schema.validate(input);
  }
}

const schema = yup.object().shape({
  code: yup.string().required(),
  token: yup.string().required()
});
