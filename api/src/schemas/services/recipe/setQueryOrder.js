import _ from 'lodash';
import { raw } from 'objection';

export default function setQueryOrder({ query, order, tableName = 'recipes' }) {
  if (order) {
    const orderField = {
      name: `${tableName}.name`,
      createdAt: `${tableName}.createdAt`,
      updatedAt: `${tableName}.updatedAt`,
      score: [raw(`${tableName}.stats #> '{scores,low}' ${order.direction} nulls last`)],
      views: [raw(`${tableName}.stats #> '{views,count}' ${order.direction} nulls last`)],
      comments: [raw(`${tableName}.stats #> '{comments,comments}' ${order.direction} nulls last`)],
      favourites: [raw(`${tableName}.stats #> '{favourites,favourites}' ${order.direction} nulls last`)],
      best: [raw(`${tableName}.best ${order.direction}, updated_at desc`)]
    }[order.field];

    if (orderField) {
      if (_.isArray(orderField)) {
        query.orderByRaw(orderField[0]);
      } else {
        query.orderBy(orderField, order.direction);
      }
    }
  }
}
