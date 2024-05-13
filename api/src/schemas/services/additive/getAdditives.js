import _ from 'lodash';
import { raw, ref } from 'objection';

import Additive from 'models/additive';

export default function getAdditives({ search, page, order, user }) {
  if (!(_.isEmpty(user))) {
    return _.tap(Additive.query().whereNotDeleted(), (query) => {
      query.where({ userId: user.id });

      page?.limit && query.limit(page.limit);
      page?.offset && query.limit(page.offset);

      if (search?.name) {
        query.where('weighted_tsv', '@@', raw('websearch_to_tsquery(?)', [search.name]));
      }

      if (order?.field && order?.direction) {
        const orderField = orderFields[order.field] || order.field;

        query.orderBy(orderField, order.direction);
      }
    });
  }
}

const orderFields = {
  recipeCount: ref('stats:recipes.count')
};
