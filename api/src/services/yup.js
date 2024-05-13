// eslint-disable-next-line import/prefer-default-export
export function validate(object, schema) {
  return schema.validate(object, {
    abortEarly: false,
    stripUnknown: true
  });
}
