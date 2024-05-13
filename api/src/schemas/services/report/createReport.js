import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction, raw } from 'objection';

import Report from 'models/report';

import { emptyObjectChecker } from 'services/errors';

export default async function createReport({
  user,
  input: { reportableId, reportableType, report, notes },
  trx: extTrx
}) {
  /* eslint-disable global-require */
  const reportableTypeMap = {
    comments: require('models/comment').default,
    forums: require('models/comment').default,
    posts: require('models/post').default,
    recipes: require('models/recipe').default
  };
  /* eslint-enable global-require */

  const Model = reportableTypeMap[reportableType];
  const internalTrx = _.isEmpty(extTrx);
  const trx = extTrx || (await transaction.start(Report.knex()));

  let dbReport;
  let reportable;

  return Bluebird
    .resolve(getReportable())
    .then(createReportIfNotExists)
    .then(updateReportableStats)
    .tapCatch(() => internalTrx && trx.rollback())
    .tap(() => internalTrx && trx.commit())
    .then(() => dbReport);

  // implementation

  function getReportable() {
    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(reportableId)
      )
      .tap(emptyObjectChecker)
      .then(res => (reportable = res));
  }

  // here we either:
  // 1. insert a new report
  // 2. delete the report from the same user if toggled
  function createReportIfNotExists() {
    return reportable
      .$relatedQuery('reports', trx)
      .where({ userId: user.id })
      .first()
      .then((res) => {
        if (_.isEmpty(res)) {
          // 1. insert a new report
          return reportable
            .$relatedQuery('reports', trx)
            .insert({
              userId: user.id,
              report,
              notes
            })
            .returning('*');
        } else {
          // 3. delete the vote from the same user if toggled
          return res
            .$query(trx)
            .delete()
            .returning('*');
        }
      })
      .then(res => (dbReport = res));
  }

  function updateReportableStats() {
    return Report
      .query(trx)
      .count('report as reports')
      .where({
        reportableId,
        reportableType
      })
      .first()
      .then(({ reports }) => {
        return reportable
          .$query(trx)
          .patch({
            stats: raw("jsonb_set(coalesce(stats, '{}'::jsonb), ?, ?, true)", ['{reports}', {
              reports: Number(reports)
            }])
          });
      });
  }
}
