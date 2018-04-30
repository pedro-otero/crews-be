const winston = require('winston');

const discogs = require('../api/discogs');
const search = require('../search');

const { combine, printf, timestamp } = winston.format;

const createLogger = ({ id, artists: [{ name: artist }], name }) => winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: combine(timestamp(), printf(info => `${info.timestamp} ${artist} - ${name} (${id}) :: ${info.message}`)),
    }),
    new winston.transports.File({
      level: 'debug',
      format: combine(timestamp(), printf(info => `${info.timestamp}  ${info.message}`)),
      filename: `app/log/${id}.log`,
    }),
  ],
});

module.exports = search(discogs, createLogger);
