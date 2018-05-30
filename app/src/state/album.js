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

const inRange = (positionsMap, trackString, separator, position) => {
  const [left, right] = splitTrim(trackString, separator)
    .map(i => positionsMap[i]);
  const p = positionsMap[position];
  return (left <= p) && (p <= right);
};

Album.prototype.merge = function (release) {
  const positionsMap = release.tracklist
    .reduce((all, track, i) => Object.assign(all, { [track.position]: i }), {});
  // EXTRACT CREDITS FROM THE RELEASE
  // 1. Merge the release "extraartists" into each corresponding track "extraartists" array.
  //    Some releases in Discogs have an "extraartists" array which contains credits of
  //    individual tracks.
  //    The following lines map the contents of such array into an structure grouped by
  //    track, matching the existing one in "tracklist"
  release.tracklist.map(({ position, extraartists = [] }) => ({
    extraartists: extraartists.concat((release.extraartists || [])
      .filter(({ tracks, role }) => !!tracks && !!role)
      .filter(({ tracks }) => splitTrim(tracks, ',')
        .reduce((accum, trackString) => accum || (() => {
          if (trackString.includes('-')) {
            return inRange(positionsMap, trackString, '-', position);
          } else if (trackString.includes('to')) {
            return inRange(positionsMap, trackString, 'to', position);
          }
          return splitTrim(trackString, ',').includes(position);
        })(), false))
      .reduce((accum, { role, name }) => accum.concat([{ role, name }]), [])),
  }))

  // 2. Split the resulting credits array so there's one entry for every role
    .forEach(({ extraartists }, i) => {
      extraartists.reduce((trackCredits, { name, role }) => trackCredits
        .concat(splitTrim(role, ',').map(r => ({
          name,
          role: r,
        }))), [])

        // MERGE NEWLY EXTRACTED CREDITS WITH THE ONES CURRENTLY IN STATE
        .forEach(ea => this.tracks[i].addCredit(ea));
    });
};

module.exports = Album;
