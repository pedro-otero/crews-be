const winston = require('winston');
const Throxy = require('throxy');
const Disconnect = require('disconnect');

const { agent, keys } = require('../../../disconnect-config.json');

const discogs = {
  db: new Throxy(
    new Disconnect.Client(agent, keys).database(),
    1100
  ),
  PAUSE_NEEDED_AFTER_429: 30000,
};
const search = require('../search');

const { combine, printf, timestamp } = winston.format;

const createLogger = ({ id, artists: [{ name: artist }], name }) => winston.createLogger({
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  format: combine(
    timestamp(),
    printf(info => `${info.timestamp} ${artist} - ${name} (${id}) :: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({ level: 'info' }),
    new winston.transports.File({ filename: `app/log/${id}.log`, level: 'debug' }),
  ],
});

module.exports = search(discogs, createLogger);
