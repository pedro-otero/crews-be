module.exports = function (albumId, store) {
  return {
    getMasterSearchResults: () => {
      return store.getState().results.masters
        .filter(result => result.album === albumId)
        .reduce((all, item) => all.concat(item.page.results), []);
    },
    getReleaseSearchResults: () => {
      return store.getState().results.releases.filter(result => result.album === albumId);
    },
  }
};