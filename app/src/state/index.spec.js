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

  it('calculates progress of a no results search', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 1,
        pages: 1,
        items: 0,
        per_page: 100,
      },
      results: [],
    });
    assert.equal(state.getProgress('S1'), 100);
  });

  it('calculates progress of search that has not retrieved any release yet', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 1,
        pages: 1,
        items: 5,
        per_page: 100,
      },
      results: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    });
    assert.equal(state.getProgress('S1'), 0);
  });

  it('calculates progress of search that has not gotten results yet', () => {
    delete state.searches[0].lastSearchPage;
    assert.equal(state.getProgress('S1'), 0);
  });

  it('calculates progress of search that has not retrieved some releases yet', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 1,
        pages: 1,
        items: 5,
        per_page: 100,
      },
      results: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    });
    state.setLastRelease('S1', { id: 3 });
    assert.equal(state.getProgress('S1'), 60);
  });

  it('calculates progress of a finished search', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 1,
        pages: 1,
        items: 5,
        per_page: 100,
      },
      results: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
    });
    state.setLastRelease('S1', { id: 5 });
    assert.equal(state.getProgress('S1'), 100);
  });

  it('calculates progress of a multipage search that has not started its latest page', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 2,
        pages: 2,
        items: 4,
        per_page: 2,
      },
      results: [{ id: 3 }, { id: 4 }],
    });
    state.setLastRelease('S1', { id: 2 });
    assert.equal(state.getProgress('S1'), 50);
  });

  it('calculates progress of a multipage search that has started its latest page', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 2,
        pages: 2,
        items: 4,
        per_page: 2,
      },
      results: [{ id: 4 }, { id: 5 }],
    });
    state.setLastRelease('S1', { id: 4 });
    assert.equal(state.getProgress('S1'), 75);
  });

  it('calculates progress of a multipage search that has finished its last page', () => {
    state.setLastSearchPage('S1', {
      pagination: {
        page: 2,
        pages: 2,
        items: 4,
        per_page: 2,
      },
      results: [{ id: 4 }, { id: 5 }],
    });
    state.setLastRelease('S1', { id: 5 });
    assert.equal(state.getProgress('S1'), 100);
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
