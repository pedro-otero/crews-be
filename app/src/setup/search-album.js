const SpotifyWebApi = require('spotify-web-api-node');

const spotify = require('../api/spotify');
const discogs = require('../api/discogs');
const search = require('../search');
const createLogger = require('../search/logger');

module.exports = search(spotify(SpotifyWebApi), discogs, createLogger);