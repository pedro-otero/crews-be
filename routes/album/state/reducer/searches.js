const {
  ADD_SEARCH,
  SET_STATUS,
} = require('../action/constants');

const idFilter = id => item => item.id === id;

module.exports = (state = [], { type, id, releases, album, status }) => {
  let search, newSearch;
  switch (type) {
    case ADD_SEARCH:
      newSearch = { id, status: 'ADDED' };
      break;
    case SET_STATUS:
      search = state.find(idFilter(id));
      newSearch = Object.assign({}, search, { status });
      break;
    default:
      return state;
  }
  return [newSearch, ...state.filter(idFilter(id))];
};