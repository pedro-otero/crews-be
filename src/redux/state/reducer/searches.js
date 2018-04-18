const {
  ADD_SEARCH,
  PUT_ERRORS,
} = require('../action/constants');

module.exports = (state = [], {
  type, id, errors,
}) => {
  switch (type) {
    case ADD_SEARCH:
      return state.concat({ id, errors: [] });
    case PUT_ERRORS:
      const search = state.find(s => s.id === id);
      Object.assign(search, { errors: search.errors.concat(errors) });
      return state.filter(s => s.id !== id).concat(search);
    default:
      return state;
  }
};
