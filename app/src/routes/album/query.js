const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res) => {
  const {
    app: {
      locals: { state },
    },
    params: { spotifyAlbumId },
  } = req;

  try {
    const query = {
      id: spotifyAlbumId,
      progress: state.getProgress(spotifyAlbumId),
      bestMatch: state.albums.find(a => a.id === spotifyAlbumId),
    };
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json(error);
  }
});
