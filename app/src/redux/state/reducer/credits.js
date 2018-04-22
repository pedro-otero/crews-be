const { ADD_CREDITS } = require('../action/constants');

module.exports = (state = [], { type, credits }) => {
  switch (type) {
    case ADD_CREDITS:
      return [
        ...credits.filter(({ name, role, track }) =>
          !state.find(s => s.name === name && s.role === role && s.track === track)),
        ...state];
    default:
      return state;
  }
};
