module.exports = function (albumId, store) {
  return {
    getMasterSearchResults: () => {
      return store.getState().results.masters.filter(result => result.album === albumId);
    },
    getReleaseSearchResults: () => {
      return store.getState().results.releases.filter(result => result.album === albumId);
    },
  }
};