const winston = require('winston');

const discogs = require('../api/discogs');
const search = require('../search');

const { combine, printf, timestamp } = winston.format;

const createLogger = album => winston.createLogger({
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  format: combine(timestamp(), printf(info => `${info.timestamp} ${info.message}`)),
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({ filename: `app/log/${album.id}.log`, level: 'debug' }),
  ],
});

module.exports = search(discogs, createLogger);
