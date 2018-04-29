const express = require('express');

const router = express.Router();

const func = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: { locals: { searchAlbum, store, actions } },
    params: { spotifyAlbumId },
  } = req;

  const existing = store.getState().searches.find(s => s.id === spotifyAlbumId);
  if (!existing) {
    const search = searchAlbum(spotifyAlbumId);
    search.start();
    actions.addSearch(spotifyAlbumId);
  }
  next();
});

module.exports = func;
