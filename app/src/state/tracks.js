const accents = require('remove-accents');

const roles = require('./roles');

const tracks = (track) => {
  const isComposer = ({ role }) => roles.composers.includes(role);
  const isProducer = ({ role }) => roles.producers.includes(role);
  const isFeatured = ({ role }) => roles.featured.includes(role);
  const addSpecialRole = (array, name) => {
    if (!accents.has(name) && !array.map(accents.remove).includes(name)) {
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
      } else if (!accents.has(name) && !(name in track.credits)) {
        track.credits[name] = [role];
      } else if (accents.has(name) && accents.remove(name) in track.credits) {
        track.credits[name] = track.credits[accents.remove(name)];
        if (!track.credits[name].includes(role)) {
          track.credits[name].push(role);
        }
        delete track.credits[accents.remove(name)];
      } else {
        track.credits[name].push(role);
      }
    },
  };
};

tracks.create = (id, name) => ({
  id, name, composers: [], producers: [], featured: [], credits: {},
});

module.exports = tracks;
