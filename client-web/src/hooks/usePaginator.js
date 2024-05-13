import _ from 'lodash';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import qs from 'qs';
import { useQuery } from '@apollo/client';


export default function usePaginator({
  summaryQuery,
  itemsQuery,
  skip,
  perPage = 10
}) {
  const { search } = useLocation();

  const locationPage = qs.parse(search, { ignoreQueryPrefix: true });
  const activePage = _.chain(locationPage).get('page', 1).toNumber().value();
  const page = { offset: (activePage - 1) * perPage, limit: perPage };

  const { data, loading, refetch, updateQuery } = useQuery(itemsQuery.query, {
    variables: {
      ...(itemsQuery.variables || {}),
      page
    },
    skip
  });

  const items = data?.[itemsQuery.dataKey];

  const dataSummary = useSummaryQueryOnlyOnce({
    query: summaryQuery.query,
    variables: summaryQuery.variables,
    items,
    skip
  });

  const totalPages = _.ceil(_.get(dataSummary, [summaryQuery.dataKey, 'count'], 0) / perPage);

  const paginatorProps = {
    totalPages,
    activePage,
    refetch,
    perPage
  };

  return {
    paginatorProps,
    loading,
    updateQuery,
    page,
    refetch,
    items
  };
}

function useSummaryQueryOnlyOnce({ query, variables, items, skip }) {
  const first = useRef(true);
  const queried = useRef();
  const result = useRef();

  const { data = {} } = useQuery(query, {
    variables,
    skip: first.current || queried.current || skip
  });

  useEffect(() => {
    if (first.current) {
      first.current = false;
    }

    if (!(queried.current) && !(_.isEmpty(items)) && !(_.isEmpty(data))) {
      queried.current = true;
      result.current = data;
    }
  }, [items, data, variables]);

  useEffect(() => {
    queried.current = false;
    result.current = null;
  }, [variables]);


  return result.current || data;
}
