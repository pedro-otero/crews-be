const { ADD_MATCHES } = require('../action/constants');

module.exports = (state = [], { type, releases }) => {
  switch (type) {
    case ADD_MATCHES:
      return [...releases, ...state];
  }
  return state;
};