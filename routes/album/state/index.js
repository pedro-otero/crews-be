const { createStore, combineReducers } = require('redux');
const reducers = require('./reducers');

module.exports = createStore(combineReducers(reducers));