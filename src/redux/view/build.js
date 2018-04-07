function splitRange(tracksstring) {
  const split = tracksstring.split('to')
    .map(s => s.trim());
  const start = Number(split[0]);
  const end = Number(split[1]);
  return new Array(end).map((item, i) => start + i);
}

const getTracksList = tracksstring => tracksstring
  .split(',')
  .map(s => s.trim())
  .map(el => (el.includes('to') ? splitRange(el) : el))
  .reduce((a, b) => a.concat(b), []);

const roles = {
  producers: ['Producer', 'Produced By', 'Producer [Produced By]'],
  composers: ['Written-By', 'Lyrics By', 'Music By'],
  featured: ['Featuring', 'feat.'],
};

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
  const result = {
    title: spotifyTrack.name,
    producers: reduce(allCredits)('producers'),
    composers: reduce(allCredits)('composers'),
    featured: reduce(allCredits)('featured'),
    credits: allCredits.reduce((credits, credit) => {
      const newCredits = credit.role.split(', ')
        .filter(role => !roles.producers.includes(role) &&
          !roles.composers.includes(role) &&
          !roles.featured.includes(role));
      if (newCredits.length) {
        if (!(credit.name in credits)) {
          credits.defineProperty(credit.name, []);
        }
        credits[credit.name].push(...newCredits);
      }
      return credits;
    }, {}),
  };
  return result;
};

module.exports = (spotifyAlbum, discogsRelease) => ({
  tracks: spotifyAlbum.tracks.items.map(buildSong(discogsRelease)),
});
