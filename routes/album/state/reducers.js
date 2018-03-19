const { ADD_SEARCH, ADD_ALBUM, ADD_MATCHES } = require('./actions');
const { combineReducers } = require('redux');

const idFilter = id => item => item.id === id;

const searches = (state = [], { type, id, releases, albumId }) => {
  switch (type) {
    case ADD_SEARCH:
      return [{ id, matches: [] }, ...state];
    case ADD_MATCHES:
      const { matches } = state.find(idFilter(albumId));
      return [{
        id: albumId,
        matches: [releases.map(release => release.id), ...matches]
      }, ...state.filter(idFilter(id))];
  }
  return state;
};

const albums = (state = [], { type, album }) => {
  switch (type) {
    case ADD_ALBUM:
      return [album, ...state];
  }
  return state;
}

const releases = (state = [], { type, releases }) => {
  switch (type) {
    case ADD_MATCHES:
      return [...releases, ...state];
  }
  return state;
}

module.exports = combineReducers({ searches, albums, releases });