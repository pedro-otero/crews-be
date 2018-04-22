const { ADD_CREDITS } = require('./constants');

module.exports = (album, release) => {
  const credits = [];
  return {
    type: ADD_CREDITS,
    credits,
  };
};
