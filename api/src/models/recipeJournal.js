import { compose, Model } from 'objection';

import setCreatedAt from 'models/plugins/setCreatedAt';
import setUpdatedAt from 'models/plugins/setUpdatedAt';

const mixins = compose(
  setCreatedAt,
  setUpdatedAt
);

export default class RecipeJournal extends mixins(Model) {
  static tableName = 'recipe_journals';
}
