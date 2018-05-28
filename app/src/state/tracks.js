const accents = require('remove-accents');

const roles = require('./roles');

const tracks = (track) => {
  const isComposer = ({ role }) => roles.composers.includes(role);
  const isProducer = ({ role }) => roles.producers.includes(role);
  const isFeatured = ({ role }) => roles.featured.includes(role);
  const addComposer = (name) => {
    if (!accents.has(name) && !track.composers.includes(name)) {
      track.composers.push(name);
    } else if (accents.has(name) && track.composers.includes(accents.remove(name))) {
      track.composers.splice(track.composers.findIndex(i => i === accents.remove(name)), 1, name);
    }
  };
  const addProducer = (name) => {
    if (!track.producers.includes(name)) {
      track.producers.push(name);
    }
  };
  const addFeatured = (name) => {
    if (!track.featured.includes(name)) {
      track.featured.push(name);
    }
  };
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
