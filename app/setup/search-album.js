const Throxy = require('throxy');
const Disconnect = require('disconnect');
const minimist = require('minimist');
const winston = require('winston');

const search = require('../src/search/index');

const {
  agent,
  consumerKey,
  consumerSecret,
  throttleTime = 1100,
  PAUSE_NEEDED_AFTER_429 = 30000,
} = minimist(process.argv.slice(2));


const discogs = {
  db: new Throxy(
    new Disconnect.Client(agent, { consumerKey, consumerSecret }).database(),
    throttleTime
  ),
  PAUSE_NEEDED_AFTER_429,
};

const {
  createLogger,
  transports,
  format: { combine, printf, timestamp },
} = winston;
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

const SpotifyWebApi = require('spotify-web-api-node');
const { store, actions } = require('../src/redux/state');
const Query = require('../src/redux/view/query');

const query = require('../src/routes/album/query');
const searchRoute = require('../src/routes/album/search');
const spotify = require('../src/routes/album/spotify');

const SpotifyWrapper = require('../src/api/spotify');

module.exports = (app) => {
  /* App locals setup */
  Object.assign(app, {
    locals: {
      store,
      actions,
      searchAlbum: search(discogs, loggerFactory),
      Query,
      spotify: SpotifyWrapper(SpotifyWebApi),
    },
  });

  // Routes setup
  // 1. Fetches album from Spotify
  app.use('/data/album', spotify);
  // 2. Starts a earch if there isn't one already
  app.use('/data/album', searchRoute);
  // 3. Queries the store for data about an album and sends it to client
  app.use('/data/album', query);
};

