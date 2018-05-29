const Track = require('./track');

const Album = function ({
  id, artists: [{ name: artist }], name, tracks: { items },
}) {
  Object.assign(this, {
    id,
    name,
    artist,
    tracks: items.map(i => new Track(i.id, i.name)),
  });
};

module.exports = Album;
