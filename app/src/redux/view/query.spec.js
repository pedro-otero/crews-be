const assert = require('assert');

const Query = require('./query');

describe('Search state view', () => {
  describe('gets search query object', () => {
    before(function () {
      this.mockStore = state => ({ getState: () => state });
    });

    it('progress 0 because of no retrieved releases', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
        results: [{
          album: 1,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 4,
            },
            results: [],
          },
        }],
        releases: [],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 0);
    });

    it('progress 0 because of no search results', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
        results: [{
          album: 2,
          page: {
            pagination: {
              page: 1,
              pages: 2,
              items: 4,
            },
            results: [],
          },
        }],
        releases: [],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 0);
    });

    it('partial, one page, 50%', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
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
        releases: [{ id: 1, tracklist: [] }],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 50);
    });

    it('partial, two pages, one fully loaded, 40%', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
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
        releases: [{ id: 1, tracklist: [] }, { id: 2, tracklist: [] }],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 67);
    });

    it('partial, two pages, one fully loaded, second partially, 75%', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
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
        releases: [
          { id: 1, tracklist: [] },
          { id: 2, tracklist: [] },
          { id: 3, tracklist: [] }],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 75);
    });

    it('full', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [] },
        }],
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
        releases: [
          { id: 1, tracklist: [] },
          { id: 2, tracklist: [] },
          { id: 3, tracklist: [] },
          { id: 4, tracklist: [] }],
      });
      const query = Query(store)(1);
      assert.equal(query.progress, 100);
    });

    it('picks the best match', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [{ name: 'track' }] },
        }],
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
        releases: [
          {
            id: 1,
            tracklist: [{ title: 'similar track' }],
          },
          { id: 2, tracklist: [{ title: 'track', extraartists: [{ name: 'some guy', role: 'Producer' }] }] }],
      });
      const query = Query(store)(1);
      assert.equal(query.bestMatch.tracks[0].producers[0], 'some guy');
    });

    it('safely finds no match', function () {
      const store = this.mockStore({
        searches: [{ id: 1 }],
        albums: [{
          id: 1,
          tracks: { items: [{ name: 'track 1' }, { name: 'track 2' }] },
        }],
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
        releases: [
          {
            id: 1,
            tracklist: [{ title: 'track 1' }],
          },
          { id: 2, tracklist: [{ title: 'track 1', extraartists: [{ name: 'some guy', role: 'Producer' }] }] }],
      });
      const query = Query(store)(1);
      assert.equal(query.bestMatch, null);
    });

    it('returns null if there is no album data', function () {
      const store = this.mockStore({ albums: [], searches: [] });
      const query = Query(store)(1);
      assert(query === null);
    });
  });
});
