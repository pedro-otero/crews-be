const {
  ADD_ALBUM,
} = require('./constants');

const addAlbum = ({
  id, artists: [{ name: artist }], name, tracks: { items },
}) => ({
  type: ADD_ALBUM,
  album: Object.assign({}, {
    id,
    name,
    artist,
    tracks: items,
  }),
});

module.exports = addAlbum;
