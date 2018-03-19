const { combineReducers } = require('redux');

const { ADD_SEARCH, ADD_ALBUM, ADD_MATCHES } = require('./actions');

const buildAlbum = require('../build');
const matchAlbum = require('../match');

const idFilter = id => item => item.id === id;

const searches = (state = [], { type, id, releases, album }) => {
  switch (type) {
    case ADD_SEARCH:
      return [{ id, matches: [], status: 'ADDED' }, ...state];
    case ADD_MATCHES:
      const { matches } = state.find(idFilter(album.id));
      const release = matchAlbum(album, releases);
      const builtAlbum = buildAlbum(album, release);
      return [{
        id: album.id,
        status: 'MATCHED',
        matches: [releases.map(release => release.id), ...matches],
        builtAlbum
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