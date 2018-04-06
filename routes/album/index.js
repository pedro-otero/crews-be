const express = require('express');
const router = express.Router();

const { store } = require('../../src/redux/state');
const Query = require('../../src/redux/view/query');
const searchAlbum = require('../../src/search');

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