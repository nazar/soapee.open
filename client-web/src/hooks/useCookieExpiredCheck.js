import { useEffect } from 'react';

import { renewToken, resetAuthenticated } from 'services/auth';
import { isLoggedIn, tokenAboutToExpire } from 'services/token';
import useAuthenticated from 'hooks/useAuthenticated';

export default function useCookieExpiredCheck() {
  const authenticated = useAuthenticated();

  useEffect(() => {
    const interval = setInterval(() => {
      const validToken = isLoggedIn();

      if (!(validToken) && authenticated) {
        return resetAuthenticated();
      } else {
        const aboutToExpire = tokenAboutToExpire();

        if (aboutToExpire) {
          return renewToken();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [authenticated]);
}
