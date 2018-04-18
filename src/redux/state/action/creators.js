const {
  ADD_SEARCH,
  ADD_ALBUM,
  ADD_RELEASE,
  ADD_RELEASE_RESULTS,
  PUT_ERRORS,
  REMOVE_SEARCH,
  REMOVE_RELEASE_RESULTS,
  REMOVE_RELEASES,
} = require('./constants');

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

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

const putError = (id, error) => ({
  type: PUT_ERRORS,
  id,
  errors: [error],
});

const removeSearch = (id) => ({
  type: REMOVE_SEARCH,
  id,
});

const removeResults = (id) => ({
  type: REMOVE_RELEASE_RESULTS,
  id,
});

const removeReleases = (releases) => ({
  type: REMOVE_RELEASES,
  releases,
});

module.exports = {
  addSearch,
  addAlbum,
  addRelease,
  releaseResults,
  putError,
  removeSearch,
  removeResults,
  removeReleases,
};
