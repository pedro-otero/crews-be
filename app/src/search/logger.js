const winston = require('winston');

const levels = {
  info: 0,
  error: 1,
};
const createTransports = albumId => [
  new winston.transports.Console({ level: 'error' }),
  new winston.transports.File({ filename: `app/log/${albumId}.log`, level: 'error' }),
];

module.exports = album => winston.createLogger({
  levels,
  format: winston.format.simple(),
  transports: createTransports(album.id),
});
