const {
  ADD_ALBUM,
} = require('./constants');

const addAlbum = ({ id, name, tracks: { items } }) => ({
  type: ADD_ALBUM,
  album: Object.assign({}, {
    id,
    name,
    tracks: items,
  }),
});

module.exports = addAlbum;
