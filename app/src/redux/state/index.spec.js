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

  describe('searches', () => {
    before(() => {
      actions.addSearch('S1');
    });

    it('adds', () => {
      assert.deepEqual(store.getState().searches, [{ id: 'S1' }]);
    });

    it('sets last search page', () => {
      actions.setLastSearchPage('S1', {
        pagination: {
          page: 1,
          pages: 2,
          items: 500,
          per_page: 100,
        },
        results: [{ id: 1 }],
      });
      assert.deepEqual(store.getState().searches[0].lastSearchPage, {
        page: 1,
        pages: 2,
        items: 500,
        perPage: 100,
        releases: [1],
      });
    });

    it('sets last release', () => {
      actions.setLastRelease('S1', 5);
      assert.equal(store.getState().searches[0].lastRelease, 5);
    });
  });
});
