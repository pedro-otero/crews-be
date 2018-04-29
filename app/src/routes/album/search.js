const express = require('express');

const router = express.Router();

const func = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: { locals: { searchAlbum, store } },
    params: { spotifyAlbumId },
  } = req;

  const existing = store.getState().searches.find(s => s.id === spotifyAlbumId);
  if (!existing) {
    const search = searchAlbum(spotifyAlbumId);
    search.start();
  }
  next();
});

module.exports = func;
