const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: {
      locals: { spotify, state },
    },
    params: { spotifyAlbumId },
  } = req;

  const album = state.getState().albums.find(a => a.id === spotifyAlbumId);
  if (album) {
    next();
  } else {
    spotify.getApi()
      .then(
        api => api.getAlbum(spotifyAlbumId)
          .then(({ body }) => {
            state.addAlbum(body);
            next();
          }, () => res.status(404).end()),
        () => res.status(500).end()
      );
  }
});
