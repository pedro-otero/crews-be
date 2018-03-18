const { ADD_SEARCH } = require('./actions');
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

module.exports = combineReducers({ searches });