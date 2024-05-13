import _ from 'lodash';
import { useCreation } from 'ahooks';
import hashSum from 'hash-sum';

export default function useFormFieldHasErrors({ register, name, all = false }) {
  const { errors, dirty, status } = register.registerMetaFields();

  return useCreation(() => {
    return hasErrors({ name, errors, dirty, status, all });
    // hashSum to trigger on content updates only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashSum([errors, dirty, status])]);
}

function hasErrors({ name, errors, dirty, status, all }) {
  const isDirty = _.get(dirty, name) || all;

  if (isDirty) {
    const hasStatus = _.get(status, name);

    const pathHasErrors = _.chain(errors)
      .filter({ path: name })
      .isEmpty()
      .thru((isEmpty) => !(isEmpty))
      .value();

    return pathHasErrors || hasStatus;
  }
}
