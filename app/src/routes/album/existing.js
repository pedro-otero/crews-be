const express = require('express');

const router = express.Router();

const func = getQuery => router.get('/:spotifyAlbumId', (req, res) => {
  const {
    params: { spotifyAlbumId },
  } = req;

  try {
    const query = getQuery(spotifyAlbumId);
    if (query) {
      res.status(200).json(query);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = func;
