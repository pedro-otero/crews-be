const express = require('express');
const router = express.Router();

const searchAlbum = require('../../src/search');

router.get('/:spotifyAlbumId', function (req, res) {
  const { discogs, spotify } = req.app.locals;
  const { spotifyAlbumId } = req.params;
  const { status, data } = searchAlbum(spotify, spotifyAlbumId, discogs);
  res.status(status).json(data);
});

module.exports = router;