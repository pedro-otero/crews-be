const assert = require('assert');

const state = require('./index');

describe('State module', () => {
  it('adds albums', () => {
    state.addAlbum({
      id: 1,
      name: 'Album name',
      artists: [{ name: 'The Artist' }],
      tracks: {
        items: [{ id: 'T1', name: 'Track #1', x: 'y' }],
      },
    });
    assert.deepEqual(state.data().albums[0], {
      id: 1,
      name: 'Album name',
      artist: 'The Artist',
      tracks: [{ id: 'T1', name: 'Track #1' }],
    });
  });

  describe('searches', () => {
    before(() => {
      state.addSearch('S1');
    });

    it('adds', () => {
      assert.deepEqual(state.data().searches, [{ id: 'S1' }]);
    });

    it('sets last search page', () => {
      state.setLastSearchPage('S1', {
        pagination: {
          page: 1,
          pages: 2,
          items: 500,
          per_page: 100,
        },
        results: [{ id: 1 }],
      });
      assert.deepEqual(state.data().searches[0].lastSearchPage, {
        page: 1,
        pages: 2,
        items: 500,
        perPage: 100,
        releases: [1],
      });
    });

    it('sets last release', () => {
      state.setLastRelease('S1', { id: 5 });
      assert.equal(state.data().searches[0].lastRelease, 5);
    });

    it('clears search', () => {
      state.clearSearch('S1');
      assert.deepEqual(state.data().searches[0], {
        id: 'S1',
        lastSearchPage: null,
        lastRelease: null,
      });
    });

    after(() => {
      state.removeSearch('S1');
      assert.equal(state.data().searches.length, 0);
    });
  });
});
