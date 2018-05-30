const Throxy = require('throxy');
const Disconnect = require('disconnect');
const winston = require('winston');
const SpotifyWebApi = require('spotify-web-api-node');

const State = require('../src/state');
const createSearchFunction = require('../src/search');
const createSpotifyModule = require('../src/api/spotify');
const Query = require('../src/query');

// Middleware
const query = require('../src/routes/album/query');
const searchMiddleware = require('../src/routes/album/search');
const spotify = require('../src/routes/album/spotify');


const {
  agent,
  consumerKey,
  consumerSecret,
  throttleTime = 1100,
  PAUSE_NEEDED_AFTER_429 = 30000,
} = process.env;


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
const loggerCreator = ({ id, artist, name }) => createLogger({
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

module.exports = (app) => {
  /* App locals setup */
  const state = new State();
  Object.assign(app, {
    locals: {
      state,
      searchAlbum: createSearchFunction(discogs, loggerCreator, state),
      Query,
      spotify: createSpotifyModule(SpotifyWebApi),
    },
  });

  // CORS header
  app.use('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN || '*');
    next();
  });

  // Routes setup
  // 1. Fetches album from Spotify
  app.use('/data/album', spotify);
  // 2. Starts a search if there isn't one already
  app.use('/data/album', searchMiddleware);
  // 3. Queries the store for data about an album and sends it to client
  app.use('/data/album', query);
};

