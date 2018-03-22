const { bindActionCreators } = require('redux');
const store = require('../');

module.exports = bindActionCreators(require('./creators'), store.dispatch);