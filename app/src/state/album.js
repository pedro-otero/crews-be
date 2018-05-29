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
  const { tracklist, extraartists: releaseExtraArtists } = release;
  const translatePosition = position => tracklist.findIndex(t => t.position === position);
  const inRange = (trackString, separator, position) => {
    const [left, right] = splitTrim(trackString, separator).map(translatePosition);
    const p = translatePosition(position);
    return (left <= p) && (p <= right);
  };

  // EXTRACT CREDITS FROM THE RELEASE
  // 1. Merge the release "extraartists" into each corresponding track "extraartists" array.
  //    Some releases in Discogs have an "extraartists" array which contains credits of
  //    individual tracks.
  //    The following lines map the contents of such array into an structure grouped by
  //    track, matching the existing one in "tracklist"
  tracklist.map(({ position, extraartists = [] }) => ({
    position,
    extraartists: extraartists.concat((releaseExtraArtists || [])
      .filter(({ tracks, role }) => !!tracks && !!role)
      .filter(({ tracks }) => splitTrim(tracks, ',')
        .reduce((accum, trackString) => accum || (() => {
          if (trackString.includes('-')) {
            return inRange(trackString, '-', position);
          } else if (trackString.includes('to')) {
            return inRange(trackString, 'to', position);
          }
          return splitTrim(trackString, ',').includes(position);
        })(), false))
      .reduce((accum, { role, name }) => accum.concat([{ role, name }]), [])),
  }))

  // 2. Split the resulting credits array so there's one entry for every role
    .forEach(({ extraartists }, i) => {
      const track = this.tracks[i];
      const newCredits = extraartists.reduce((trackCredits, { name, role }) => trackCredits
        .concat(splitTrim(role, ',').map(r => ({
          name,
          role: r,
        }))), []);

      // MERGE NEWLY EXTRACTED CREDITS WITH THE ONES CURRENTLY IN STATE
      newCredits.forEach(ea => track.addCredit(ea));
    });
};

module.exports = Album;
