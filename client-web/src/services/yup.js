// eslint-disable-next-line import/prefer-default-export
export function castStrip(schema, input) {
  return schema.cast(input, {
    stripUnknown: true
  });
}
