const { ADD_CREDITS } = require('./constants');

module.exports = ({ tracks: { items } }, { tracklist }) => {
  const credits = items.reduce((all, { id: track }, i) => all
    .concat(tracklist[i].extraartists.map(({ name, role }) => ({ track, name, role }))), []);
  return {
    type: ADD_CREDITS,
    credits,
  };
};
