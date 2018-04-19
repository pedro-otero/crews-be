const roles = require('./roles');

function splitRange(tracksstring) {
  const split = tracksstring.split('to')
    .map(s => s.trim());
  const start = Number(split[0]);
  const end = Number(split[1]);
  return [...Array((end - start) + 1).keys()].map((item, i) => String(start + i));
}

const getTracksList = tracksstring => tracksstring
  .split(',')
  .map(s => s.trim())
  .map(el => (el.includes('to') ? splitRange(el) : el))
  .reduce((a, b) => a.concat(b), []);

const reduce = allCredits => highlightedRole => allCredits
  .filter(credit => credit.role.split(', ')
    .some(role => roles[highlightedRole].includes(role)))
  .map(credit => credit.name);

const buildSong = ({ tracklist, extraartists = [] }) => (spotifyTrack, trackIndex) => {
  const track = tracklist[trackIndex];
  const position = track.position || String(trackIndex + 1);
  const allCredits = extraartists
    .filter(credit => getTracksList(credit.tracks)
      .includes(position))
    .concat(track.extraartists || []);
  return {
    title: spotifyTrack.name,
    producers: reduce(allCredits)('producers'),
    composers: reduce(allCredits)('composers'),
    featured: reduce(allCredits)('featured'),
    credits: allCredits.reduce((credits, credit) => {
      const newCredits = credit.role.split(', ')
        .filter(role => !roles.producers.includes(role) &&
          !roles.composers.includes(role) &&
          !roles.featured.includes(role));
      const result = Object.assign({}, credits);
      if (newCredits.length) {
        if (!(result.name in result)) {
          result[credit.name] = [];
        }
        result[credit.name].push(...newCredits);
      }
      return result;
    }, {}),
  };
};

module.exports = (spotifyAlbum, discogsRelease) => ({
  tracks: spotifyAlbum.tracks.items.length ? spotifyAlbum.tracks.items.map(buildSong(discogsRelease)) : [],
});
