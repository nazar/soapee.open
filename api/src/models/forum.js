import { compose, Model } from 'objection';

import actsAsFavouriteable from 'models/plugins/actsAsFavouriteable';
import actsAsPostable from 'models/plugins/actsAsPostable';
import setUpdatedAt from 'models/plugins/setUpdatedAt';
import actsAsReportable from 'models/plugins/actsAsReportable';

const mixins = compose(
  actsAsPostable({ postableTable: 'forums' }),
  actsAsFavouriteable({
    favouriteableTable: 'forums'
  }),
  actsAsReportable({
    reportableTable: 'forums'
  }),
  setUpdatedAt
);

export default class Forum extends mixins(Model) {
  static tableName = 'forums';
}
