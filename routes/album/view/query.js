module.exports = function (albumId, store) {
  return {
    getMasterSearchResults: () => {
      return store.getState().results.masters.filter(result => result.album === albumId);
    }
  }
};