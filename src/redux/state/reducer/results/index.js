const { combineReducers } = require('redux');

const releases = require('./releases');

module.exports = combineReducers({ releases });