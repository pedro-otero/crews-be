const accents = require('remove-accents');

const roles = require('./roles');

const isComposer = role => roles.composers.includes(role);
const isProducer = role => roles.producers.includes(role);
const isFeatured = role => roles.featured.includes(role);

const addSpecialRole = (array, name) => {
  if (!accents.has(name) && !array.map(accents.remove).includes(name)) {
    array.push(name);
  } else if (accents.has(name) && array.includes(accents.remove(name))) {
    array.splice(array.findIndex(i => i === accents.remove(name)), 1, name);
  }
};

const Track = function (id, name) {
  this.id = id;
  this.name = name;
  this.composers = [];
  this.producers = [];
  this.featured = [];
  this.credits = {};
};

Track.prototype.addComposer = function (name) {
  addSpecialRole(this.composers, name);
};

Track.prototype.addProducer = function (name) {
  addSpecialRole(this.producers, name);
};

Track.prototype.addFeatured = function (name) {
  addSpecialRole(this.featured, name);
};

Track.prototype.addCollaborator = function (name, role) {
  const { credits } = this;
  if (!credits[name] && !credits[accents.remove(name)]) {
    credits[name] = [role];
  } else if (accents.has(name) && credits[accents.remove(name)]) {
    credits[name] = credits[accents.remove(name)];
    if (!credits[name].includes(role)) {
      credits[name].push(role);
    }
    delete credits[accents.remove(name)];
  } else if (!credits[name].includes(role)) {
    credits[name].push(role);
  }
};

Track.prototype.addCredit = function ({ name, role }) {
  if (isComposer(role)) {
    this.addComposer(name);
  } else if (isProducer(role)) {
    this.addProducer(name);
  } else if (isFeatured(role)) {
    this.addFeatured(name);
  } else {
    this.addCollaborator(name, role);
  }
};

module.exports = Track;
