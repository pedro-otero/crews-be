const { ADD_ALBUM, ADD_MATCHES } = require('../action/constants');
const searches = require('./searches');

const albums = (state = [], { type, album }) => {
  switch (type) {
    case ADD_ALBUM:
      return [album, ...state];
  }
  return state;
};

const releases = (state = [], { type, releases }) => {
  switch (type) {
    case ADD_MATCHES:
      return [...releases, ...state];
  }
  return state;
};

module.exports = ({ searches, albums, releases });