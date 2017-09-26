const express = require('express');
const router = express.Router();

const buildAlbum = require('./build');
const matchAlbum = require('./match');

router.get('/:spotifyAlbumId', function (req, res) {

    const discogify = req.app.locals.discogify;
    const spotifyApi = req.app.locals.spotifyApi;

    const doCatch = e => {
        require('debug')('main')(e);
        res.status(500).send(e.stack)
    }

    spotifyApi
        .then(api => api.getAlbum(req.params.spotifyAlbumId))
        .then(response => response.body)
        .then(album => {
            discogify.findReleases(album).then(releases => {
                const release = matchAlbum(album, releases);
                const builtAlbum = buildAlbum(album, release);
                res.json(builtAlbum);
            }).catch(doCatch);
        }).catch(doCatch);
});

module.exports = router;