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

Album.prototype.merge = function (release) {
  const positionsMap = release.tracklist
    .reduce((all, { position }, i, arr) => Object.assign(all, {
      [position]: {
        i,
        next: (arr[i + 1] || { position: null }).position,
        extraartists: [],
      },
    }), {});

  const splitRange = ([p1, p2], arr = []) => {
    if (!p2) {
      return [p1];
    }
    const { next, i } = positionsMap[p1];
    if (!next || i === positionsMap[p2].i) {
      return [...arr, p1];
    }
    return [p1, ...splitRange([next, p2], arr)];
  };

  // EXTRACT CREDITS FROM THE RELEASE
  // 1. Some releases in Discogs have an "extraartists" array which contains credits of
  //    individual tracks.
  //    The following lines map the contents of such array into an structure grouped by
  //    track, matching the existing one in "tracklist"
  const parallel = (release.extraartists || [])
    .filter(({ tracks, role }) => !!tracks && !!role)
    .reduce((all, { name, role, tracks }) => all.concat(splitTrim(tracks, ',')
      .map(t => ({ name, role, tracks: t }))), [])
    .reduce((all, { name, role, tracks }) => all.concat(splitRange(splitTrim(tracks, 'to'))
      .map(t => ({ name, role, tracks: t }))), [])
    .reduce((all, { name, role, tracks }) => all.concat(splitRange(splitTrim(tracks, '-'))
      .map(t => ({ name, role, tracks: t }))), [])
    .reduce((all, { name, role, tracks }) => all.concat(splitTrim(role, ',')
      .map(r => ({ name, role: r, tracks }))), [])
    .reduce((map, { name, role, tracks }) => {
      map[tracks].extraartists.push({ name, role });
      return map;
    }, positionsMap);

  // 2. Merge the release "extraartists" into each corresponding track "extraartists" array.
  release.tracklist.map(({ position, extraartists = [] }) => ({
    extraartists: extraartists
      .reduce((all, { name, role, tracks }) => all.concat(splitTrim(role, ',')
        .map(r => ({ name, role: r, tracks }))), [])
      .concat(parallel[position].extraartists),
  }))

  // 3. Iterate tracks to add credits
    .forEach((t, i) => t.extraartists.forEach(ea => this.tracks[i].addCredit(ea)));
};

module.exports = Album;
