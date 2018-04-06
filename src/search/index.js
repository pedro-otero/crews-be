const { store, actions } = require('../redux/state');
const Query = require('../redux/view/query');

module.exports = function searchAlbum(spotify, spotifyAlbumId, discogs) {

  const doCatch = e => {
    console.log(e);
    return;
  };

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (search) {
    const query = Query(spotifyAlbumId, store);
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
        actions.addSearch(spotifyAlbumId);
        return api.getAlbum(spotifyAlbumId);
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
        id: spotifyAlbumId,
        status: 'CREATED'
      },
      status: 201
    };
  }
};