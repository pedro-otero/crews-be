const assert = require('assert');
const sinon = require('sinon');

const Album = require('./album');
const State = require('./index');
const album = require('./mocks/album');
const mockRelease = require('./mocks/release');

describe('State module', () => {
  const state = new State();
  state.addSearch('S1');

  it('adds searches', () => {
    assert.deepEqual(state.searches, [{ id: 'S1' }]);
  });

  it('adds albums', () => {
    const albumSpy = sinon.spy(Album);
    state.addAlbum(album);
    assert(albumSpy.calledWithNew);
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
    assert.deepEqual(state.searches[0].lastSearchPage, {
      page: 1,
      pages: 2,
      items: 500,
      perPage: 100,
      releases: [1],
    });
  });

  it('sets last release', () => {
    state.setLastRelease('S1', { id: 5 });
    assert.equal(state.searches[0].lastRelease, 5);
  });

  it('adds credits', () => {
    state.addAlbum(album);
    const mergeSpy = sinon.spy(Album.prototype, 'merge');
    state.addCredits(album.id, mockRelease);
    assert(mergeSpy.calledOnce);
  });

  it('clears search', () => {
    state.clearSearch('S1');
    assert.deepEqual(state.searches[0], {
      id: 'S1',
      lastSearchPage: null,
      lastRelease: null,
    });

    after(() => {
      state.removeSearch('S1');
      assert.equal(state.searches.length, 0);
    });
  });
});
