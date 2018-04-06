const { bindActionCreators, createStore, combineReducers } = require('redux');
const reducers = require('./reducer');

const store = createStore(combineReducers(reducers));

exports.actions = bindActionCreators(require('./action/creators'), store.dispatch);
exports.store = store;