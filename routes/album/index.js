const express = require('express');
const router = express.Router();

const store = require('./state');
const actions = require('./state/actions');

router.get('/:spotifyAlbumId', function (req, res) {


  const discogify = req.app.locals.discogify;
  const spotifyApi = req.app.locals.spotifyApi;

  const doCatch = e => {
    console.log(e);
    return;
  };

  const search = store.getState().searches.find(item => item.id === req.params.spotifyAlbumId);

  if (!search) {
    spotifyApi
      .then(api => {
        const albumId = req.params.spotifyAlbumId;
        store.dispatch(actions.addSearch(albumId));
        return api.getAlbum(albumId);
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