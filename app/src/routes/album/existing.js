const express = require('express');

const router = express.Router();

const func = getQuery => router.get('/:spotifyAlbumId', (req, res) => {
  const {
    params: { spotifyAlbumId },
  } = req;

  const query = getQuery(spotifyAlbumId);
  if (query) {
    res.status(200).json(query);
  }
});

module.exports = func;
