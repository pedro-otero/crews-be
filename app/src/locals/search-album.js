const SpotifyWebApi = require('spotify-web-api-node');
const winston = require('winston');

const spotify = require('../api/spotify');
const discogs = require('../api/discogs');
const search = require('../search');

const createLogger = ({ id }) => winston.createLogger({
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

module.exports = search(spotify(SpotifyWebApi), discogs, createLogger);
