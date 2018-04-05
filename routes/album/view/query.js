module.exports = function (albumId, store) {
  const state = () => store.getState();

  return {
    getMasterSearchResults: () => {
      return state().results.masters
        .filter(result => result.album === albumId)
        .reduce((all, item) => all.concat(item.page.results), []);
    },
    getReleaseSearchResults: () => {
      return state().results.releases
        .filter(result => result.album === albumId)
        .reduce((all, item) => all.concat(item.page.results), []);
    },
  }
};