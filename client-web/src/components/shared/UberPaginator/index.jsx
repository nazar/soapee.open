import React from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'semantic-ui-react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import qs from 'qs';

import useMedia, { mobile } from 'hooks/useMedia';

import './style.styl';

export default function UberPaginator({ totalPages, activePage, refetch, perPage }) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const isMobile = useMedia(mobile);
  const paginationItems = isMobile ? 0 : 1;

  return (
    <div className="uber-paginator">
      {totalPages > 1 && (
        <div className="paginator-element">
          <Pagination
            totalPages={totalPages}
            activePage={activePage}
            boundaryRange={paginationItems}
            siblingRange={paginationItems}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );

  //


  function handlePageChange(e, { activePage: newActivePage }) {
    const nextPage = qs.stringify({ page: newActivePage });

    history.push(`${url}?${nextPage}`);

    return refetch({ page: { offset: (newActivePage - 1) * perPage, limit: perPage } });
  }
}

UberPaginator.defaultProps = {
  activePage: 1,
  perPage: 10
};

UberPaginator.propTypes = {
  totalPages: PropTypes.number.isRequired,
  activePage: PropTypes.number,
  refetch: PropTypes.func.isRequired,
  perPage: PropTypes.number
};
