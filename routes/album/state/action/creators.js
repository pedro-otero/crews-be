const { bindActionCreators } = require('redux');
const store = require('./');

const {
  ADD_SEARCH,
  ADD_ALBUM,
  ADD_MATCHES,
  SET_STATUS,
  RESULTS,
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

const results = (id, entity, results) => ({
  type: RESULTS,
  id,
  entity,
  results
});

module.exports = bindActionCreators({
  addSearch,
  addAlbum,
  addMatches,
  setStatus,
  results,
}, store.dispatch);