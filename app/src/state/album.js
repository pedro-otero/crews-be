const Track = require('./track');

const splitTrim = (value, separator) => value.split(separator).map(v => v.trim());

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

const splitRoles = (all, { name, role, tracks }) => all
  .concat(splitTrim(role, ',')
    .map(r => ({ name, role: r, tracks })));

Album.prototype.merge = function ({ tracklist, extraartists }) {
  const positionsMap = tracklist
    .reduce((all, { position }, i, arr) => Object.assign(all, {
      [position]: {
        i,
        next: (arr[i + 1] || { position: null }).position,
        extraartists: [],
      },
    }), {});

  const expandRange = ([p1, p2], arr = []) => {
    if (!p2) {
      return [p1];
    }
    const { next, i } = positionsMap[p1];
    if (!next || i === positionsMap[p2].i) {
      return [...arr, p1];
    }
    return [p1, ...expandRange([next, p2], arr)];
  };

  // EXTRACT CREDITS FROM THE RELEASE
  // 1. Some releases in Discogs have an "extraartists" array which contains credits of
  //    individual tracks.
  //    The following lines map the contents of such array into an structure grouped by
  //    track, matching the existing one in "tracklist" and adding it to each track
  (extraartists || [])
    .filter(({ tracks, role }) => !!tracks && !!role)
    // Split comma separated multi track extraartists into one per track
    .reduce((all, { name, role, tracks }) => all
      .concat(splitTrim(tracks, ',')
        .map(t => ({ name, role, tracks: t }))), [])
    // Split literal range multi track extraartists into one per track
    .reduce((all, { name, role, tracks }) => all
      .concat(expandRange(splitTrim(tracks, 'to'))
        .map(t => ({ name, role, tracks: t }))), [])
    // Split hyphenated range multi track extraartists into one per track
    .reduce((all, { name, role, tracks }) => all
      .concat(expandRange(splitTrim(tracks, '-'))
        .map(t => ({ name, role, tracks: t }))), [])
    // Split multi role extraartists into one per track
    .reduce(splitRoles, [])
    .forEach(({ name, role, tracks }) => {
      this.tracks[positionsMap[tracks].i].addCredit({ name, role });
    });

  // 2. Merge individual track's "extraartists" into each corresponding track of this album.
  tracklist.forEach((track, i) => {
    (track.extraartists || [])
      .reduce(splitRoles, [])
      .forEach(extraartist => this.tracks[i].addCredit(extraartist));
  });
};

module.exports = Album;
