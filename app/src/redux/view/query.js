const similarity = require('string-similarity').compareTwoStrings;

const buildAlbum = require('./build');

const compareTracklist = (spotify, discogs) => {
  if (discogs.length !== spotify.length) {
    return 0;
  }
  return spotify
    .map(track => track.name)
    .map((track, i) => similarity(track, discogs[i].title))
    .reduce((sum, current, i, array) => sum + (current / array.length), 0);
};

module.exports = store => function (id) {
  const {
    searches, results, albums, releases, credits,
  } = store.getState();

  const search = searches.find(item => item.id === id);
  if (!search) { return null; }

  const album = albums.find(item => item.id === id);
  const pages = results.filter(result => result.album === id);

  const retrievedReleases = pages
    .reduce((all, item) => all.concat(item.page.results), [])
    .filter(release => releases.map(r => r.id).includes(release.id))
    .map(release => releases.find(r => r.id === release.id));

  const progress = (() => {
    if (!pages.length) {
      return 0;
    }
    const total = pages.filter(result => result.page.pagination.page === 1)[0]
      .page.pagination.items;
    const soFar = retrievedReleases.length;
    return Math.round((soFar / total) * 100);
  })();

  const bestMatch = (() => {
    const { tracks: { items: tracks } } = album;
    const albumCredits = credits
      .filter(credit => tracks.map(track => track.id).includes(credit.track));
    return buildAlbum(album, albumCredits);
  })();

  return { id, progress, bestMatch };
};
