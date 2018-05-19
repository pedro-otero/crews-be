const buildAlbum = require('./build');

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
    if (items === 0) {
      return 100;
    }
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