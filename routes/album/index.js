const express = require('express');

const router = express.Router();

const func = searchAlbum => router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: { locals: { discogs, spotify } },
    params: { spotifyAlbumId },
  } = req;

  const data = searchAlbum(spotify, spotifyAlbumId, discogs);
  res.status(200).json(data);
});

module.exports = func;
