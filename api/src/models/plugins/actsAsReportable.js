import Report from 'models/report';

export default function(incomingOptions) {
  const options = Object.assign({
    reportableTable: null
  }, incomingOptions);

  if (!(options.reportableTable)) {
    throw Error('reportableTable is required');
  }

  return (Model) => {
    return class extends Model {
      static get relationMappings() {
        return {
          ...(Model.relationMappings || {}),

          reports: {
            relation: Model.HasManyRelation,
            modelClass: Report,
            filter: { reportableType: options.reportableTable },
            beforeInsert(model) {
              model.reportableType = options.reportableTable;
            },
            join: {
              from: `${options.reportableTable}.id`,
              to: 'reports.reportableId'
            }
          }
        };
      }
    };
  };
}
