const {
  ADD_SEARCH,
  ADD_ALBUM,
  ADD_MATCHES,
  SET_STATUS,
  ADD_MASTER_RESULTS,
  ADD_RELEASE_RESULTS,
} = require('./constants');

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

const addMatches = (album, releases) => ({
  type: ADD_MATCHES,
  album,
  releases
});

const setStatus = (id, status) => ({
  type: SET_STATUS,
  id,
  status
});

const masterResults = (album, results) => ({
  type: ADD_MASTER_RESULTS,
  album,
  results
});

const releaseResults = (album, results) => ({
  type: ADD_RELEASE_RESULTS,
  album,
  results
});

module.exports = {
  addSearch,
  addAlbum,
  addMatches,
  setStatus,
  masterResults,
  releaseResults,
};