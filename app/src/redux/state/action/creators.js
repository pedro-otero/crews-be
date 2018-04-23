const {
  ADD_ALBUM,
  ADD_RELEASE,
  ADD_RELEASE_RESULTS,
  REMOVE_SEARCH,
  REMOVE_RELEASE_RESULTS,
  REMOVE_RELEASES,
} = require('./constants');

const addCredits = require('./credits');
const searches = require('./searches');

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

const addRelease = release => ({
  type: ADD_RELEASE,
  release,
});

const releaseResults = (album, page) => ({
  type: ADD_RELEASE_RESULTS,
  album,
  page,
});

const removeSearch = id => ({
  type: REMOVE_SEARCH,
  id,
});

const removeResults = id => ({
  type: REMOVE_RELEASE_RESULTS,
  id,
});

const removeReleases = releases => ({
  type: REMOVE_RELEASES,
  releases,
});

module.exports = Object.assign({}, searches, {
  addAlbum,
  addRelease,
  releaseResults,
  removeSearch,
  removeResults,
  removeReleases,
  addCredits,
});
