const express = require('express');

const router = express.Router();

const func = router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: { locals: { searchAlbum } },
    params: { spotifyAlbumId },
  } = req;

  searchAlbum(spotifyAlbumId).then((data) => {
    res.status(200).json(data);
  });
});

module.exports = func;
