const {
  ADD_ALBUM,
} = require('./constants');

const addCredits = require('./credits');
const searches = require('./searches');

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

module.exports = Object.assign({}, searches, {
  addAlbum,
  addCredits,
});
