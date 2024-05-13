import { useReactiveVar } from '@apollo/client';

import { authenticatedVar } from 'cache';

export default function useAuthenticated() {
  return useReactiveVar(authenticatedVar);
}
