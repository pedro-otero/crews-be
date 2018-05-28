const roles = require('./roles');

const tracks = (track) => {
  const isComposer = extraartist => roles.composers.includes(extraartist.role);
  const addComposer = name => track.composers.push(name);
  return {
    addCredit: (extraartist) => {
      if (isComposer(extraartist)) {
        addComposer(extraartist.name);
      }
    },
  };
};

tracks.create = (id, name) => ({
  id, name, composers: [], producers: [], featured: [], credits: {},
});

module.exports = tracks;
