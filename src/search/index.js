const { store, actions } = require('../redux/state');
const Query = require('../redux/view/query');

module.exports = (spotify, id, discogs) => {
  const search = store.getState().searches.find(item => item.id === id);

  if (search) {
    const query = Query(id, store);
    return {
      id,
      progress: query.getProgress(),
      bestMatch: query.getBestMatch(),
    };
  }
  spotify
    .then((api) => {
      actions.addSearch(id);
      return api.getAlbum(id);
    })
    .then(({ body: album }) => {
      actions.addAlbum(album);
      discogs.findReleases(album);
    });
  return {
    id,
    progress: 0,
    bestMatch: null,
  };
};
