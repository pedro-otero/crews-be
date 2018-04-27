const winston = require('winston');

module.exports = ({ id }) => winston.createLogger({
  levels: {
    info: 0,
    error: 1,
  },
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({ level: 'error' }),
    new winston.transports.File({ filename: `app/log/${id}.log`, level: 'error' }),
  ],
});
