import React from 'react';
import PropTypes from 'prop-types';

import SortOrderBar from 'components/shared/SortOptionsBar';

const extraOptionsFirst = [
  { value: { field: 'best', direction: 'asc' }, text: 'Best Recipes', key: 3 },
  { value: { field: 'views', direction: 'desc' }, text: 'Most Viewed', key: 7 },
  { value: { field: 'comments', direction: 'desc' }, text: 'Most Commented', key: 5 },
  { value: { field: 'favourites', direction: 'desc' }, text: 'Most Favourited', key: 9 },
  { value: { field: 'updatedAt', direction: 'desc' }, text: 'Recently Updated', key: 15 }
];

const extraOptionsLast = [
  { value: { field: 'name', direction: 'asc' }, text: 'Name ascending', key: 50 },
  { value: { field: 'name', direction: 'desc' }, text: 'Name descending', key: 60 }
];


export default function RecipeOrderBar({ order, onChange }) {
  return (
    <SortOrderBar
      visible
      order={order}
      onChange={onChange}
      extraOptionsFirst={extraOptionsFirst}
      extraOptionsLast={extraOptionsLast}
    />
  );
}

RecipeOrderBar.propTypes = {
  order: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export const defaultOrder = { field: 'best', direction: 'asc' };
export const recentRecipes = { field: 'updatedAt', direction: 'desc' };
