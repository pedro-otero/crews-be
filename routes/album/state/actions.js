const ADD_SEARCH = 'ADD_SEARCH';

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

const ADD_ALBUM = 'ADD_ALBUM';

const addAlbum = album => ({
  type: ADD_ALBUM,
  album,
});

const ADD_MATCHES = 'ADD_MATCHES';

const addMatches = (album, releases) => ({
  type: ADD_MATCHES,
  album,
  releases
});

const SET_STATUS = 'SET_STATUS';

const setStatus = (id, status) => ({
  type: SET_STATUS,
  id,
  status
});

const RESULTS = 'RESULTS';

const results = (id, entity, results) => ({
  type: RESULTS,
  id,
  entity,
  results
});

module.exports = {
  ADD_SEARCH, addSearch,
  ADD_ALBUM, addAlbum,
  ADD_MATCHES, addMatches,
  SET_STATUS, setStatus,
  RESULTS, results,
};