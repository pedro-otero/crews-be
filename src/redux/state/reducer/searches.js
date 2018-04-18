const {
  ADD_SEARCH,
} = require('../action/constants');

module.exports = (state = [], {
  type, id,
}) => {
  switch (type) {
    case ADD_SEARCH:
      return state.concat({ id, errors: [] });
    default:
      return state;
  }
};
