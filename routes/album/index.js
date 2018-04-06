const express = require('express');
const router = express.Router();

const searchAlbum = require('../../src/search');

router.get('/:spotifyAlbumId', function (req, res) {
  const {
    app: { locals: { discogs, spotify } },
    params: { spotifyAlbumId }
  } = req;

  const { status, data } = searchAlbum(spotify, spotifyAlbumId, discogs);
  res.status(status).json(data);
});

module.exports = router;