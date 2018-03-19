const { ADD_SEARCH, ADD_ALBUM } = require('./actions');
const { combineReducers } = require('redux');

const searches = (state = {}, { type, id }) => {
  switch (type) {
    case ADD_SEARCH:
      const newSearch = { matches: [] };
      return Object.assign({
        [id]: newSearch
      }, state);
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

module.exports = combineReducers({ searches, albums });