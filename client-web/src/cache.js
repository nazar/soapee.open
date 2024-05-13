import { InMemoryCache, makeVar } from '@apollo/client';

import { isLoggedIn } from 'services/token';

export const cache = new InMemoryCache();
export const authenticatedVar = makeVar(isLoggedIn());
export const hasMeVar = makeVar(false);
