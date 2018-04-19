const assert = require('assert');

const Query = require('./query');

describe('Search state view', () => {
  it('Gets release search results', () => {
    const store = {
      getState: () => ({
        results: [{
          album: 1,
          page: {
            results: [{}],
          },
        }, {
          album: 1,
          page: {
            results: [{}, {}],
          },
        }],
      }),
    };
    const query = Query(1, store);
    const releaseSearchResults = query.getReleaseSearchResults();
    assert.equal(3, releaseSearchResults.length);
  });

  it('Gets retrieved releases', () => {
    const store = {
      getState: () => ({
        results: [{
          album: 1,
          page: {
            results: [{ id: 'r1' }, { id: 'r2' }],
          },
        }],
        releases: [{ id: 'r1' }, { id: 'r2' }],
      }),
    };
    const query = Query(1, store);
    const releases = query.getRetrievedReleases();
    assert.equal(2, releases.length);
  });

  it('Gets album', () => {
    const store = {
      getState: () => ({
        albums: [{ id: 1 }],
      }),
    };
    const query = Query(1, store);
    const album = query.getAlbum();
    assert(album);
  });

  describe('gets search query object', () => {
    before(function () {
      this.mockStore = state => ({ getState: () => state });
    });

    it('progress 0 because of no retrieved releases', function () {
      const store = this.mockStore({
        results: [{
          album: 1,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 4,
            },
          },
        }],
        releases: [],
      });
      const query = Query(1, store);
      assert.equal(query.get().progress, 0);
    });

    it('progress 0 because of no search results', function () {
      const store = this.mockStore({
        results: [{
          album: 2,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 4,
            },
          },
        }],
        releases: [],
      });
      const query = Query(1, store);
      assert.equal(query.get().progress, 0);
    });

    it('partial, one page, 50%', function () {
      const store = this.mockStore({
        results: [{
          album: 1,
          page: {
            pagination: {
              page: 1,
              pages: 1,
              items: 2,
            },
            results: [{ id: 1 }, { id: 2 }],
          },
        }],
        releases: [{ id: 1 }],
      });
      const query = Query(1, store);
      assert.equal(query.get().progress, 50);
    });

    it('partial, two pages, one fully loaded, 40%', function () {
      const store = this.mockStore({
        results: [{
          album: 1,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 3,
            },
            results: [{ id: 1 }, { id: 2 }],
          },
        }, {
          album: 1,
          page: {
            pagination: {
              pagination: {
                page: 2,
                pages: 2,
                items: 3,
              },
            },
            results: [{ id: 3 }],
          },
        }],
        releases: [{ id: 1 }, { id: 2 }],
      });
      const query = Query(1, store);
      assert.equal(query.get().progress, 67);
    });

    it('partial, two pages, one fully loaded, second partially, 75%', function () {
      const store = this.mockStore({
        results: [{
          album: 1,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 4,
            },
            results: [{ id: 1 }, { id: 2 }],
          },
        }, {
          album: 1,
          page: {
            pagination: {
              pagination: {
                page: 2,
                pages: 2,
                items: 4,
              },
            },
            results: [{ id: 3 }, { id: 4 }],
          },
        }],
        releases: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
      const query = Query(1, store);
      assert.equal(query.get().progress, 75);
    });
  });
});
