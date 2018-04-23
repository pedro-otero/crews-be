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
    searches, albums, credits,
  } = store.getState();

  const search = searches.find(item => item.id === id);
  if (!search) { return null; }

  const album = albums.find(item => item.id === id);

  const progress = (() => {
    const { lastSearchPage, lastRelease } = search;
    if (!lastSearchPage) {
      return 0;
    }
    const {
      page, items, perPage, releases,
    } = lastSearchPage;
    const soFar = ((page - 1) * perPage) + (releases.indexOf(lastRelease) + 1);
    return Math.round((soFar / items) * 100);
  })();

  const bestMatch = (() => {
    const { tracks: { items: tracks } } = album;
    const albumCredits = credits
      .filter(credit => tracks.map(track => track.id).includes(credit.track));
    return buildAlbum(album, albumCredits);
  })();

  return { id, progress, bestMatch };
};
