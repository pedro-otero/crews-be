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
});
