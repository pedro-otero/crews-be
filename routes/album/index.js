const express = require('express');
const router = express.Router();

const { store, actions } = require('../../src/redux/state');
const Query = require('../../src/redux/view/query');

function searchAlbum(spotifyApi, spotifyAlbumId, discogify) {

  const doCatch = e => {
    console.log(e);
    return;
  };

  spotifyApi
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
      discogify.findReleases(album).catch(doCatch);
    })
    .catch(doCatch);
}

router.get('/:spotifyAlbumId', function (req, res) {

  const { discogify, spotifyApi } = req.app.locals;
  const { spotifyAlbumId } = req.params;

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (search) {
    const query = Query(spotifyAlbumId, store);
    res.json(Object.assign(search, {
      bestMatch: query.getBestMatch(),
      built: query.getAllMatches(),
    }));
  } else {
    searchAlbum(spotifyApi, spotifyAlbumId, discogify);
    res.status(201).json({ id: spotifyAlbumId, status: 'CREATED' });
  }
  return;
});

module.exports = router;