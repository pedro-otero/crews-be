const express = require('express');
const router = express.Router();

const { store, actions } = require('../../src/redux/state');
const Query = require('../../src/redux/view/query');

function searchAlbum(spotify, spotifyAlbumId, discogs) {

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
}

router.get('/:spotifyAlbumId', function (req, res) {

  const { discogs, spotify } = req.app.locals;
  const { spotifyAlbumId } = req.params;

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (search) {
    const query = Query(spotifyAlbumId, store);
    res.json(Object.assign(search, {
      bestMatch: query.getBestMatch(),
      built: query.getAllMatches(),
    }));
  } else {
    searchAlbum(spotify, spotifyAlbumId, discogs);
    res.status(201).json({ id: spotifyAlbumId, status: 'CREATED' });
  }
  return;
});

module.exports = router;