const assert = require('assert');

const { actions, store } = require('./index');

describe('State module', () => {
  it('adds albums', () => {
    actions.addAlbum({
      id: 1,
      name: 'Album name',
      artists: [{ name: 'The Artist' }],
      tracks: {
        items: [{ id: 'T1', name: 'Track #1', x: 'y' }],
      },
    });
    assert.deepEqual(store.getState().albums[0], {
      id: 1,
      name: 'Album name',
      artist: 'The Artist',
      tracks: [{ id: 'T1', name: 'Track #1' }],
    });
  });
});
