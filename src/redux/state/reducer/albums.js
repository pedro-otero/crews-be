const { ADD_ALBUM } = require('../action/constants');

module.exports = (state = [], { type, album }) => {
  switch (type) {
    case ADD_ALBUM:
      return [album, ...state];
  }
  return state;
};