import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'qs';

export default function usePrint({ recipe }) {
  const history = useHistory();
  const { search } = useLocation();

  useEffect(() => {
    const query = qs.parse(search, { ignoreQueryPrefix: true });

    if (!(query.preview) && recipe) {
      document.title = `${recipe.name} - Soapee`;
      window.print();
      history.goBack();
    }
  }, [search, history, recipe]);
}
