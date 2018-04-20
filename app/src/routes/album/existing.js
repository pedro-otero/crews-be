const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: {
      locals: { getQuery },
    },
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
