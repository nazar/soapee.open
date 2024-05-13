import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirectives, MapperKind } from 'graphql-tools';

import { UserInputError } from 'services/errors';

export const adminTypeDefs = `
  directive @admin on FIELD_DEFINITION
`;

export function adminDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directives = getDirectives(schema, fieldConfig);

      if (directives.admin) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = function (source, args, context, info) {
          const { user } = context;

          if (user?.isAdmin) {
            return resolve(source, args, context, info);
          } else {
            throw new UserInputError('Not authorised');
          }
        };

        return fieldConfig;
      }
    }
  });
}
