const { ADD_MATCHES } = require('../action/constants');
const searches = require('./searches');
const albums = require('./albums');

const releases = (state = [], { type, releases }) => {
  switch (type) {
    case ADD_MATCHES:
      return [...releases, ...state];
  }
  return state;
};

module.exports = ({ searches, albums, releases });