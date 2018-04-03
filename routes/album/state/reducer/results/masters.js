const { ADD_MASTER_RESULTS } = require("../../action/constants");

module.exports = function (state = [], action) {
  const func = {
    [ADD_MASTER_RESULTS]: () => [...state, {
      album: action.album,
      results: action.results,
    }]
  }[action.type];
  if (func) {
    return func();
  }
  return state;
};