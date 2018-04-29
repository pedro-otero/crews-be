const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: {
      locals: { spotify },
    },
    params: { spotifyAlbumId },
  } = req;

  spotify.getApi().then(api => api.getAlbum(spotifyAlbumId)).then(() =>next());
});
