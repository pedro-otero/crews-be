const {
  ADD_SEARCH,
  REMOVE_SEARCH,
  SET_LAST_SEARCH_PAGE,
} = require('../action/constants');

module.exports = (state = [], {
  type, id, lastSearchPage,
}) => {
  switch (type) {
    case ADD_SEARCH: {
      return state.concat({ id });
    }
    case SET_LAST_SEARCH_PAGE: {
      return [
        Object.assign({}, state.find(search => search.id === id), { lastSearchPage }),
      ].concat(state.filter(search => search.id !== id));
    }
    case REMOVE_SEARCH: {
      return state.filter(s => s.id !== id);
    }
    default:
      return state;
  }
};
