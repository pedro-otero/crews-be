const express = require('express');
const router = express.Router();

const store = require('./state');
const actions = require('./state/actions');

router.get('/:spotifyAlbumId', function (req, res) {

  const { discogify, spotifyApi } = req.app.locals;
  const { spotifyAlbumId } = req.params;

  const doCatch = e => {
    console.log(e);
    return;
  };

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (!search) {
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

  res.json(search);
  return;
});

module.exports = router;