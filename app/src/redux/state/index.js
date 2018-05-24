const { bindActionCreators, createStore, combineReducers } = require('redux');
const reducers = require('./reducer');
const reduceCredits = require('./reducer/credits');
const getCredits = require('./action/credits');

const store = createStore(combineReducers(reducers));

const albums = [];
let credits = [];

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
    addCredits: (album, release) => {
      const newCredits = getCredits(album, release);
      credits = reduceCredits(credits, newCredits);
    },
  }
);

const realGetState = store.getState;

store.getState = () => Object.assign(realGetState(), {
  albums,
  credits,
});

exports.store = store;
