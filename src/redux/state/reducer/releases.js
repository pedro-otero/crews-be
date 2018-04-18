const {
  ADD_RELEASE,
  REMOVE_RELEASES,
} = require('../action/constants');

module.exports = (state = [], { type, release, releases }) => {
  switch (type) {
    case ADD_RELEASE:
      return [...state, release];
    case REMOVE_RELEASES:
      return state.filter(r => !releases.includes(r.id));
    default:
      return state;
  }
};
