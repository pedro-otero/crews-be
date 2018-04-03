const { combineReducers } = require('redux');

const masters = require('./masters');
const releases = require('./releases');

module.exports = combineReducers({ masters, releases });