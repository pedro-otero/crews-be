module.exports = function (albumId, store) {
  const state = () => store.getState();

  const masterResults = () => state().results.masters
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  const releaseResults = () => state().results.releases
    .filter(result => result.album === albumId)
    .reduce((all, item) => all.concat(item.page.results), []);

  return {
    getMasterSearchResults: () => masterResults(),
    getReleaseSearchResults: () => releaseResults(),
  }
};