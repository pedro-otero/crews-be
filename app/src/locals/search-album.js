const Throxy = require('throxy');
const Disconnect = require('disconnect');
const minimist = require('minimist');
const {
  createLogger,
  transports,
  format: { combine, printf, timestamp },
} = require('winston');

const {
  agent,
  consumerKey,
  consumerSecret,
  throttleTime = 1100,
  PAUSE_NEEDED_AFTER_429 = 30000,
} = minimist(process.argv.slice(2));

const search = require('../search');

const discogs = {
  db: new Throxy(
    new Disconnect.Client(agent, { consumerKey, consumerSecret }).database(),
    throttleTime
  ),
  PAUSE_NEEDED_AFTER_429,
};

const loggerFactory = ({ id, artists: [{ name: artist }], name }) => createLogger({
  transports: [
    new transports.Console({
      level: 'info',
      format: combine(
        timestamp(),
        printf(info => `${info.timestamp} ${artist} - ${name} (${id}) :: ${info.message}`)
      ),
    }),
    new transports.File({
      level: 'debug',
      format: combine(
        timestamp(),
        printf(info => `${info.timestamp}  ${info.message}`)
      ),
      filename: `app/log/${id}.log`,
    }),
  ],
});

module.exports = search(discogs, loggerFactory);
