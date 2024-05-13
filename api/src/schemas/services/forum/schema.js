import * as yup from 'yup';
import _ from 'lodash';

const semanticColors = [
  'red',
  'orange',
  'yellow',
  'olive',
  'green',
  'teal',
  'blue',
  'violet',
  'purple',
  'pink',
  'brown',
  'grey',
  'black'
];

const base = {
  summary: yup.string()
    .max(200)
    .required(),
  banner: yup.string()
    .required(),
  forumType: yup.string()
    .oneOf(['public', 'restricted'])
    .required(),
  forumTags: yup.array().of(
    yup.object({
      id: yup.string().nullable(),
      tag: yup.string().required().max(50),
      color: yup.string().oneOf(semanticColors)
    })
  )
    .nullable()
    .test('duplicate-tags', 'Duplicate tag names detected', duplicateForumTags)
};

export const createForumSchema = yup.object({
  name: yup.string()
    .min(3)
    .max(20)
    .test(
      'no_lower_start_end',
      'cannot start or end with underscore',
      value => _.isNull(value.match(/^_|_$/))
    )
    .test(
      'valid_chars',
      '${value} is not a valid forum name.', // eslint-disable-line
      value => !(_.isNull(value.match(/^[A-Za-z_]+$/)))
    ),
  ...base
});

export const updateForumSchema = yup.object(base);

function duplicateForumTags(forumTags) {
  if (_.isEmpty(forumTags)) {
    return true;
  } else {
    return _.chain(forumTags)
      .groupBy(({ tag }) => _.toLower(tag))
      .values()
      .some(tagValues => tagValues.length > 1)
      .thru(res => !(res))
      .value();
  }
}
