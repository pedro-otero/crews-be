const { actions } = require('../redux/state');

module.exports = function (spotify, spotifyAlbumId, discogs) {

  const doCatch = e => {
    console.log(e);
    return;
  };

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
};