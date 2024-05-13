import path from 'path';

import _ from 'lodash';
import config from 'config';
import winston from 'winston';

const transports = [];

const customLevels = {
  levels: {
    error: 0,
    info: 1,
    request: 2,
    sql: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    info: 'yellow',
    request: 'cyan',
    sql: 'magenta',
    debug: 'green'
  }
};

// winston doesn't work well with webpack for dynamic levels to define these here manually
winston.request = _.partial(winston.log, 'request');
winston.sql = _.partial(winston.log, 'sql');

if (config.has('logging.console') && config.get('logging.console')) {
  transports.push(new (winston.transports.Console)({
    level: 'debug',
    colorize: true,
    timestamp: true,
    handleExceptions: true,
    humanReadableUnhandledException: true
  }));
}

if (config.has('logging.file') && config.has('logging.folder')) {
  const json = config.get('logging.format') === 'json';
  const logFolder = config.get('logging.folder') || path.join(__dirname, '../../..', 'logs');

  transports.push(new (winston.transports.File)({
    filename: path.join(logFolder, config.get('logging.file')),
    level: config.get('logging.level') || 'sql',
    timestamp: true,
    handleExceptions: true,
    colorize: false,
    json,
    humanReadableUnhandledException: true,
    tailable: true,
    maxsize: 1e+7, // 10mb
    maxFiles: 10,
    zippedArchive: true
  }));
}

winston.configure({
  transports,
  levels: customLevels.levels,
  colors: customLevels.colors
});


export default winston;
