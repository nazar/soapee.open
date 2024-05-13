import { useQuery } from '@apollo/client';
import { useUpdateEffect } from 'ahooks';

import useCurrentUser from 'hooks/useCurrentUser';

import additivesQuery from './additives.gql';

export default function useMyAdditives() {
  const { loading, data: { additives } = {}, refetch } = useQuery(additivesQuery, {
    fetchPolicy: 'cache-first'
  });

  const currentUser = useCurrentUser();

  useUpdateEffect(() => {
    if (currentUser) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return [additives, loading, refetch];
}
