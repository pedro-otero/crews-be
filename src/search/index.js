const { store, actions } = require('../redux/state');
const Query = require('../redux/view/query');

module.exports = function searchAlbum(spotify, id, discogs) {

  const doCatch = e => {
    console.log(e);
    return;
  };

  const search = store.getState().searches.find(item => item.id === id);

  if (search) {
    const query = Query(id, store);
    return Object.assign(search, {
      data: {
        bestMatch: query.getBestMatch(),
        built: query.getAllMatches(),
      },
      status: 200
    });
  } else {
    spotify
      .then(api => {
        actions.addSearch(id);
        return api.getAlbum(id);
      })
      .then(response => {
        const album = response.body;
        actions.addAlbum(album);
        return album;
      })
      .then(album => {
        discogs.findReleases(album).catch(doCatch);
      })
      .catch(doCatch);
    return {
      data: {
        id,
        status: 'CREATED'
      },
      status: 201
    };
  }
};