import _ from 'lodash';
// import { UserInputError } from 'apollo-server-express';
import SuperError from 'super-error';

export function emptyObjectChecker(object, exceptionText = 'Object not found') {
  if (_.isEmpty(object)) {
    throw new UserInputError(exceptionText);
  }
}

export const UserInputError = SuperError.subclass('UserInputError', function(message, extensions) {
  this.message = message;
  this.extensions = { exception: { ...(extensions || {}) } };
});
export const ForbiddenError = SuperError.subclass('UserInputError', function(message, extensions) {
  this.message = message;
  this.extensions = { exception: { ...(extensions || {}) } };
});
