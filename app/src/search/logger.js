const winston = require('winston');

const { printf, combine, timestamp: timestampFormat } = winston.format;

const levels = {
  info: 0,
  error: 1,
};
const createTransports = albumId => [
  new winston.transports.Console({ level: 'error' }),
  new winston.transports.File({ filename: `app/log/${albumId}.log`, level: 'error' }),
];

module.exports = function (album) {
  const formatFunction = ({
    message,
    timestamp,
  }) => `${timestamp} ${message}`;

  return winston.createLogger({
    levels,
    format: combine(timestampFormat(), printf(formatFunction)),
    transports: createTransports(album.id),
  });
};
