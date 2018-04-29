const SpotifyWebApi = require('spotify-web-api-node');
const winston = require('winston');

const spotify = require('../api/spotify');
const discogs = require('../api/discogs');
const search = require('../search');

const createLogger = ({ id }) => winston.createLogger({
  levels: {
    say: 0,
    notice: 1,
    detail: 2,
  },
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({ level: 'notice' }),
    new winston.transports.File({ filename: `app/log/${id}.log`, level: 'detail' }),
  ],
});

module.exports = search(spotify(SpotifyWebApi), discogs, createLogger);
