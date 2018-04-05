module.exports = function (albumId, store) {
  const state = () => store.getState();

  const masterResults = () => state().results.masters
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  return {
    getMasterSearchResults: () => masterResults(),
    getReleaseSearchResults: () => {
      return state().results.releases
        .filter(result => result.album === albumId)
        .reduce((all, item) => all.concat(item.page.results), []);
    },
    getRetrievedReleases: () => {
      return masterResults()
        .map(result => result.id)
        .reduce((releases, id) => releases.concat(
          state().releases
            .filter(release => release.master_id === id)), [])
    }
  }
};