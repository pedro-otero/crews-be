const {
  ADD_ALBUM,
  REMOVE_SEARCH,
} = require('./constants');

const addCredits = require('./credits');
const searches = require('./searches');

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

const removeSearch = id => ({
  type: REMOVE_SEARCH,
  id,
});

module.exports = Object.assign({}, searches, {
  addAlbum,
  removeSearch,
  addCredits,
});
