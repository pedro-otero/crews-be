const addCredits = require('./credits');
const searches = require('./searches');

module.exports = Object.assign({}, searches, {
  addCredits,
});
