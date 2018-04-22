const { ADD_CREDITS } = require('../action/constants');

module.exports = (state = [], { type, credits }) => {
  switch (type) {
    case ADD_CREDITS:
      return [...credits, ...state];
    default:
      return state;
  }
};
