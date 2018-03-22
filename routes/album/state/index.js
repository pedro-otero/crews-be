const { createStore, combineReducers } = require('redux');
const reducers = require('./reducer');

module.exports = createStore(combineReducers(reducers));