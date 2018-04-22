const { ADD_CREDITS } = require('./constants');

module.exports = ({ tracks: { items } }, { tracklist }) => {
  const credits = items.reduce((all, { id: track }, i) => all
    .concat(tracklist[i].extraartists
      .reduce((trackCredits, { name, role }) => trackCredits
        .concat(role.split(',').map(r => r
          .trim()).map(r => ({
          track,
          name,
          role: r,
        }))), [])), []);
  return {
    type: ADD_CREDITS,
    credits,
  };
};
