const {
  ADD_ALBUM,
} = require('./constants');

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

module.exports = addAlbum;
