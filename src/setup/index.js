const spotify = require('./spotify');
const discogs = require('./discogs');
const search = require('../search');
const { store } = require('../redux/state');

module.exports = search(spotify, discogs, store);
