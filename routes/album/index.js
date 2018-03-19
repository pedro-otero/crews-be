const express = require('express');
const router = express.Router();

const store = require('./state');
const actions = require('./state/actions');

function searchAlbum(spotifyApi, spotifyAlbumId, discogify) {

  const doCatch = e => {
    console.log(e);
    return;
  };

  spotifyApi
    .then(api => {
      store.dispatch(actions.addSearch(spotifyAlbumId));
      return api.getAlbum(spotifyAlbumId);
    })
    .then(response => {
      const album = response.body;
      store.dispatch(actions.addAlbum(album));
      return album;
    })
    .then(album => {
      discogify.findReleases(album).then(releases => {
        store.dispatch(actions.addMatches(album, releases));
      })
        .catch(doCatch);
    })
    .catch(doCatch);
}

router.get('/:spotifyAlbumId', function (req, res) {

  const { discogify, spotifyApi } = req.app.locals;
  const { spotifyAlbumId } = req.params;

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (!search) {
    searchAlbum(spotifyApi, spotifyAlbumId, discogify);
  }

  res.json(search);
  return;
});

module.exports = router;