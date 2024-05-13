import _ from 'lodash';

import useAuthenticated from 'hooks/useAuthenticated';

export default function AuthenticatedWrapper({ children }) {
  const authenticated = useAuthenticated();

  if (authenticated) {
    return _.isFunction(children) ? children() : children;
  } else {
    return null;
  }
}
