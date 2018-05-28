const accents = require('remove-accents');

const roles = require('./roles');

const tracks = (track) => {
  const isComposer = ({ role }) => roles.composers.includes(role);
  const isProducer = ({ role }) => roles.producers.includes(role);
  const isFeatured = ({ role }) => roles.featured.includes(role);
  const addSpecialRole = (array, name) => {
    if (!accents.has(name) && !array.includes(name)) {
      array.push(name);
    } else if (accents.has(name) && array.includes(accents.remove(name))) {
      array.splice(array.findIndex(i => i === accents.remove(name)), 1, name);
    }
  };
  const addComposer = name => addSpecialRole(track.composers, name);
  const addProducer = name => addSpecialRole(track.producers, name);
  const addFeatured = name => addSpecialRole(track.featured, name);
  return {
    addCredit: (extraartist) => {
      const { name, role } = extraartist;
      if (isComposer(extraartist)) {
        addComposer(name);
      } else if (isProducer(extraartist)) {
        addProducer(name);
      } else if (isFeatured(extraartist)) {
        addFeatured(name);
      } else if (!(name in track.credits)) {
        Object.assign(track, { credits: { [name]: [role] } });
      } else {
        Object.assign(track, { credits: { [name]: [...track.credits[name], role] } });
      }
    },
  };
};

tracks.create = (id, name) => ({
  id, name, composers: [], producers: [], featured: [], credits: {},
});

module.exports = tracks;
