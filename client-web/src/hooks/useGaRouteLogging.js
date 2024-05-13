import _ from 'lodash';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import hashSum from 'hash-sum';

export default function useGaRouteLogging() {
  const location = useLocation();
  const watchFields = _.pick(location, ['pathname', 'search', 'hash']);

  useEffect(() => {
    if (_.has(window, 'gtag')) {
      const path = _.chain(watchFields).values().join('').value();

      window.gtag('config', 'UA-55368874-3', { page_path: path });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashSum(watchFields)]);
}
