const compareTracklist = require('./comparators/tracklist');
const buildAlbum = require('./build');

module.exports = function (albumId, store) {
  const state = () => store.getState();

  const releaseResults = () => state().results
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  const getRetrievedReleases = () => releaseResults()
    .map(result => state().releases
      .find(item => item.id === result.id))
    .filter(item => !!item);

  const getAlbum = () => state().albums.find(album => album.id === albumId);

  const orderReleases = () => getRetrievedReleases().reduce((all, release) => {
    if (all.length) {
      const current = compareTracklist(getAlbum().tracks.items, release.tracklist);
      const first = compareTracklist(getAlbum().tracks.items, all[0].tracklist);
      if (current > first) {
        return [release, ...all];
      } else if (current > 0) {
        return all.concat(release);
      }
      return all;
    }
    return [release];
  }, []);

  const getProgress = () => {
    const pages = state()
      .results
      .filter(result => result.album === albumId);
    if (!pages.length) {
      return 0;
    }
    const total = pages.filter(result => result.page.pagination.page === 1)[0]
      .page.pagination.items;
    const soFar = getRetrievedReleases().length;
    return Math.round((soFar / total) * 100);
  };

  return {
    getAlbum,

    get: () => ({
      progress: getProgress(),
      bestMatch: buildAlbum(getAlbum(), orderReleases()[0]),
    }),
  };
};
