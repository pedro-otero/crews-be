const roles = require('./roles');

const tracks = (track) => {
  const isComposer = extraartist => roles.composers.includes(extraartist.role);
  const isProducer = extraartist => roles.producers.includes(extraartist.role);
  const isFeatured = extraartist => roles.featured.includes(extraartist.role);
  const addComposer = name => track.composers.push(name);
  const addProducer = name => track.producers.push(name);
  const addFeatured = name => track.featured.push(name);
  return {
    addCredit: (extraartist) => {
      if (isComposer(extraartist)) {
        addComposer(extraartist.name);
      } else if (isProducer(extraartist)) {
        addProducer(extraartist.name);
      } else if (isFeatured(extraartist)) {
        addFeatured(extraartist.name);
      }
    },
  };
};

tracks.create = (id, name) => ({
  id, name, composers: [], producers: [], featured: [], credits: {},
});

module.exports = tracks;
