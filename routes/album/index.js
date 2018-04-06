const express = require('express');
const router = express.Router();

const { store, actions } = require('../../src/redux/state');
const compareTracklist = require('./search/comparators/tracklist');
const buildAlbum = require('./build');
const Query = require('../../src/redux/view/query');

function searchAlbum(spotifyApi, spotifyAlbumId, discogify) {

  const doCatch = e => {
    console.log(e);
    return;
  };

  spotifyApi
    .then(api => {
      actions.addSearch(spotifyAlbumId);
      return api.getAlbum(spotifyAlbumId);
    })
    .then(response => {
      const album = response.body;
      actions.addAlbum(album);
      return album;
    })
    .then(album => {
      discogify.findReleases(album).catch(doCatch);
    })
    .catch(doCatch);
}

router.get('/:spotifyAlbumId', function (req, res) {

  const { discogify, spotifyApi } = req.app.locals;
  const { spotifyAlbumId } = req.params;

  const search = store.getState().searches.find(item => item.id === spotifyAlbumId);

  if (search) {
    const query = Query(spotifyAlbumId, store);
    const releases = query.getRetrievedReleases();
    const album = query.getAlbum();
    const ordered = releases.reduce((all, release) => {
      if (all.length) {
        const current = compareTracklist(album.tracks.items, release.tracklist);
        const first = compareTracklist(album.tracks.items, all[0].tracklist);
        if (current > first) {
          return [release, ...all];
        } else if (current > 0) {
          return all.concat(release);
        } else {
          return all;
        }
      } else {
        return [release];
      }
    }, []);
    res.json(Object.assign(search, {
      built: ordered.map(release => buildAlbum(album, release)),
      bestMatch: buildAlbum(album, ordered[0])
    }));
  } else {
    searchAlbum(spotifyApi, spotifyAlbumId, discogify);
    res.status(201).json({ id: spotifyAlbumId, status: 'CREATED' });
  }
  return;
});

module.exports = router;