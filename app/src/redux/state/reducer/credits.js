const { ADD_CREDITS } = require('../action/constants');

module.exports = (state = [], { type, album }) => {
  switch (type) {
    case ADD_CREDITS:
      return [album, ...state];
    default:
      return state;
  }
};
