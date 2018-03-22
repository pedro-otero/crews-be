const { ADD_SEARCH, ADD_ALBUM, ADD_MATCHES, SET_STATUS, RESULTS } = require('../actions');

const buildAlbum = require('../../build');
const matchAlbum = require('../../match');

const idFilter = id => item => item.id === id;

const searches = (state = [], { type, id, releases, album, status, entity, results }) => {
  let search, newSearch;
  switch (type) {
    case ADD_SEARCH:
      newSearch = { id, status: 'ADDED' };
      break;
    case ADD_MATCHES:
      const release = matchAlbum(album, releases);
      const builtAlbum = buildAlbum(album, release);
      search = state.find(idFilter(album.id));
      newSearch = Object.assign({}, search, {
        status: 'MATCHED',
        matches: [releases.map(release => release.id), ...(search.matches || [])],
        builtAlbum
      });
      break;
    case SET_STATUS:
      search = state.find(idFilter(id));
      newSearch = Object.assign({}, search, { status });
      break;
    case RESULTS:
      search = state.find(idFilter(id));
      newSearch = Object.assign({}, search, { [`${entity}Results`]: results });
      break;
    default:
      return state;
  }
  return [newSearch, ...state.filter(idFilter(id))];
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

module.exports = ({ searches, albums, releases });