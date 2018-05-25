const express = require('express');

const router = express.Router();

const func = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: { locals: { searchAlbum, state } },
    params: { spotifyAlbumId },
  } = req;

  const existing = state.data().searches.find(s => s.id === spotifyAlbumId);
  if (!existing) {
    const album = state.data().albums.find(a => a.id === spotifyAlbumId);
    const search = searchAlbum(album);
    search.start();
    state.addSearch(spotifyAlbumId);
  }
  next();
});

module.exports = func;
