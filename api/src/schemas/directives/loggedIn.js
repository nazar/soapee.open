import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirectives, MapperKind } from 'graphql-tools';

import { UserInputError } from 'services/errors';

export const loggedInTypeDefs = `
  directive @loggedIn on FIELD_DEFINITION
`;

export function loggedInDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directives = getDirectives(schema, fieldConfig);

      if (directives.loggedIn) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = function (source, args, context, info) {
          const { user } = context;

          if (user) {
            return resolve(source, args, context, info);
          } else {
            throw new UserInputError('Not logged in');
          }
        };

        return fieldConfig;
      }
    }
  });
}
