const {
  ADD_SEARCH,
  REMOVE_SEARCH,
} = require('../action/constants');

module.exports = (state = [], {
  type, id,
}) => {
  switch (type) {
    case ADD_SEARCH: {
      return state.concat({ id, errors: [] });
    }
    case REMOVE_SEARCH: {
      return state.filter(s => s.id !== id);
    }
    default:
      return state;
  }
};
