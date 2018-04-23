const {
  ADD_SEARCH,
} = require('./constants');

const addSearch = id => ({
  type: ADD_SEARCH,
  id,
});

module.exports = {
  addSearch,
};
