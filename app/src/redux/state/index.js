const { bindActionCreators, createStore, combineReducers } = require('redux');
const reducers = require('./reducer');

const store = createStore(combineReducers(reducers));

const albums = [];

exports.actions = Object.assign(
  bindActionCreators(require('./action/creators'), store.dispatch),
  {
    addAlbum: ({
      id, artists: [{ name: artist }], name, tracks: { items },
    }) => {
      albums.push({
        id,
        name,
        artist,
        tracks: items.map(i => ({ id: i.id, name: i.name })),
      });
    },
  }
);

const realGetState = store.getState;

store.getState = () => Object.assign(realGetState(), {
  albums,
});

exports.store = store;
