const addCredits = require('./credits');
const searches = require('./searches');
const addAlbum = require('./albums');

module.exports = Object.assign({}, searches, {
  addAlbum,
  addCredits,
});
