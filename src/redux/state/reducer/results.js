const {
  ADD_RELEASE_RESULTS,
  REMOVE_RELEASE_RESULTS,
} = require('../action/constants');

module.exports = function (state = [], action) {
  const func = {
    [ADD_RELEASE_RESULTS]: () => [...state, {
      album: action.album,
      page: action.page,
    }],
    [REMOVE_RELEASE_RESULTS]: () => state.filter(r => r.album !== action.album),
  }[action.type];
  if (func) {
    return func();
  }
  return state;
};
