import { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';

import { hasMeVar } from 'cache';
import useAuthenticated from 'hooks/useAuthenticated';

import meQuery from './me.gql';

export default function useCurrentUser(useCache = true) {
  const authenticated = useAuthenticated();
  const hasMe = useReactiveVar(hasMeVar);
  const fetchPolicy = useCache ? 'cache-only' : 'network-only';

  const { refetch, data: { me } = {} } = useQuery(meQuery, {
    fetchPolicy
  });

  useEffect(() => {
    if (authenticated && !(hasMe)) {
      hasMeVar(true);

      refetch();
    }
  }, [hasMe, refetch, authenticated]);

  return me;
}
