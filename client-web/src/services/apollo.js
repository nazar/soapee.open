import _ from 'lodash';

export function errorHasExceptionCode(error, code) {
  return !_.isEmpty(errorExceptionCodeValue(error, code));
}

export function errorHasExceptionCodeWithKeyData(error, code, dataKey) {
  const exception = errorExceptionCodeValue(error, code);

  if (!(_.isEmpty(exception))) {
    return _.chain(exception)
      .map(dataKey)
      .flatten()
      .value();
  }
}

export function errorExceptionCodeValue(error, code) {
  const foundGraphQLErrors = _.chain(error)
    .get('graphQLErrors')
    .filter({ extensions: { exception: { code } } })
    .map('extensions.exception')
    .value();

  const foundErrors = _.chain(error)
    .get('networkError.result.errors')
    .filter({ extensions: { exception: { code } } })
    .map('extensions.exception')
    .value();

  return _.chain(foundGraphQLErrors).concat(foundErrors).compact().value();
}
