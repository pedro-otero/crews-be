const { ADD_RELEASE } = require('../action/constants');

module.exports = (state = [], { type, release }) => {
  switch (type) {
    case ADD_RELEASE:
      return [...state, release];
    default:
      return state;
  }
};
