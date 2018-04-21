const SpotifyWebApi = require('spotify-web-api-node');

const spotify = require('./spotify');
const discogs = require('./discogs');
const search = require('../search');
const createLogger = require('../search/logger');

module.exports = search(spotify(SpotifyWebApi), discogs, createLogger);
