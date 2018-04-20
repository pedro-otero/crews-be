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

module.exports = function (id, store) {
  const { results, albums, releases } = store.getState();

  const retrievedReleases = results
    .filter(result => result.album === id)
    .reduce((all, item) => all.concat(item.page.results), [])
    .map(result => releases
      .find(item => item.id === result.id))
    .filter(item => !!item);

  const progress = (() => {
    const pages = results
      .filter(result => result.album === id);
    if (!pages.length) {
      return 0;
    }
    const total = pages.filter(result => result.page.pagination.page === 1)[0]
      .page.pagination.items;
    const soFar = retrievedReleases.length;
    return Math.round((soFar / total) * 100);
  })();

  const bestMatch = (() => {
    const album = albums.find(item => item.id === id);
    const { tracks: { items: tracks } } = album;
    const ordered = retrievedReleases.sort((a, b) => {
      const scores = {
        a: compareTracklist(tracks, a.tracklist),
        b: compareTracklist(tracks, b.tracklist),
      };
      return scores.b - scores.a;
    }).filter(({ tracklist }) => compareTracklist(tracks, tracklist) !== 0);
    if (ordered.length === 0) {
      return null;
    }
    const first = ordered[0];
    return buildAlbum(album, first);
  })();

  return { id, progress, bestMatch };
};
