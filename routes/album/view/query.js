module.exports = function (albumId, store) {
  const state = () => store.getState();

  const masterResults = () => state().results.masters
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  const releaseResults = () => state().results.releases
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  return {
    getAlbum: () => state().albums.find(album => album.id === albumId),
    getMasterSearchResults: () => masterResults(),
    getReleaseSearchResults: () => releaseResults(),
    getRetrievedReleases: () => {
      return masterResults()
        .map(result => result.id)
        .reduce((releases, id) => releases.concat(
          state().releases
            .filter(release => release.master_id === id)), [])
        .concat(releaseResults()
          .map(result => state().releases
            .find(item => item.id === result.id)))
    }
  }
};