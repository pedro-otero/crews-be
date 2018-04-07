const {
  ADD_SEARCH,
} = require('../action/constants');

const idFilter = id => item => item.id === id;

module.exports = (state = [], {
  type, id,
}) => {
  let newSearch;
  switch (type) {
    case ADD_SEARCH:
      newSearch = { id, status: 'ADDED' };
      break;
    default:
      return state;
  }
  return [newSearch, ...state.filter(idFilter(id))];
};
