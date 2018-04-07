const {
  ADD_SEARCH,
  ADD_ALBUM,
  ADD_RELEASE,
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

const addRelease = release => ({
  type: ADD_RELEASE,
  release,
});

const releaseResults = (album, page) => ({
  type: ADD_RELEASE_RESULTS,
  album,
  page,
});

module.exports = {
  addSearch,
  addAlbum,
  addRelease,
  releaseResults,
};
