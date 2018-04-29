const express = require('express');

const router = express.Router();

module.exports = router.get('/:spotifyAlbumId', (req, res, next) => {
  const {
    app: {
      locals: { spotify, actions, store },
    },
    params: { spotifyAlbumId },
  } = req;

  const album = store.getState().albums.find(a => a.id === spotifyAlbumId);
  if (album) {
    next();
  } else {
    spotify.getApi().then(api => api.getAlbum(spotifyAlbumId)).then(({ body }) => {
      actions.addAlbum(body);
      next();
    });
  }
});
