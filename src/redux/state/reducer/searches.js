const {
  ADD_SEARCH,
  PUT_ERRORS,
  REMOVE_SEARCH,
} = require('../action/constants');

module.exports = (state = [], {
  type, id, errors,
}) => {
  switch (type) {
    case ADD_SEARCH: {
      return state.concat({ id, errors: [] });
    }
    case PUT_ERRORS: {
      const search = state.find(s => s.id === id);
      Object.assign(search, { errors: search.errors.concat(errors) });
      return state.filter(s => s.id !== id).concat(search);
    }
    case REMOVE_SEARCH: {
      return state.filter(s => s.id !== id);
    }
    default:
      return state;
  }
};
