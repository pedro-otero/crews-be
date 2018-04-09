const express = require('express');

const router = express.Router();

const func = searchAlbum => router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: { locals: { discogs, spotify } },
    params: { spotifyAlbumId },
  } = req;

  const { status, data } = searchAlbum(spotify, spotifyAlbumId, discogs);
  res.status(status).json(data);
});

module.exports = func;
