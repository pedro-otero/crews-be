const express = require('express');

const router = express.Router();

const func = searchAlbum => router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: { locals: { discogs, spotify, store } },
    params: { spotifyAlbumId },
  } = req;

  const data = searchAlbum(spotify, spotifyAlbumId, discogs, store);
  res.status(200).json(data);
});

module.exports = func;
