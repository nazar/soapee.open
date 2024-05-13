import _ from 'lodash';
import { useQuery } from '@apollo/client';
import { useCreation } from 'ahooks';

import oilProperties from 'services/oilProperties';

import oilsQuery from 'queries/oil/oils.gql';

export default function useOils() {
  const { loading, data: { oils } = {} } = useQuery(oilsQuery, {
    fetchPolicy: 'cache-first'
  });

  const mappedOils = useCreation(
    () => _.chain(oils).map(omitTypename).map(oilProperties).value(),
    [oils]
  );

  return [mappedOils, loading];
}

function omitTypename(oil) {
  return {
    ...(_.omit(oil, ['__typename'])),
    breakdown: _.omit(oil.breakdown, ['__typename'])
  };
}
