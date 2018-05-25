const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: {
      locals: { Query, state },
    },
    params: { spotifyAlbumId },
  } = req;

  try {
    const getQuery = Query(state);
    const query = getQuery(spotifyAlbumId);
    if (query) {
      res.status(200).json(query);
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json(error);
  }
});
