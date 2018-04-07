const express = require('express');

const searchAlbum = require('../../src/search');

const router = express.Router();
router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: { locals: { discogs, spotify } },
    params: { spotifyAlbumId },
  } = req;

  const { status, data } = searchAlbum(spotify, spotifyAlbumId, discogs);
  res.status(status).json(data);
});

module.exports = router;
