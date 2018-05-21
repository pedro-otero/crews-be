const {
  ADD_ALBUM,
} = require('./constants');

const addAlbum = ({
  id, artists: [{ name: artist }], name, tracks: { items },
}) => ({
  type: ADD_ALBUM,
  album: {
    id,
    name,
    artist,
    tracks: items.map(i => ({ id: i.id, name: i.name })),
  },
});

module.exports = addAlbum;
