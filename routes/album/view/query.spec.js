const assert = require('assert');

const Query = require('./query');

describe('Search state view', function () {
  it('Gets master search results', function () {
    const store = {
      getState: () => ({
        results: {
          masters: [{
            album: 1,
            page: {
              results: [{}, {}, {},]
            }
          }, {
            album: 1,
            page: {
              results: [{}, {},]
            }
          },],
        },
        releases: [
          { id: 10, master_id: 'a' }, { id: 11, master_id: 'a' },
          { id: 12, master_id: 'c' }, { id: 13, master_id: 'd' },]
      })
    };
    const query = Query(1, store);
    const masterSearchResults = query.getMasterSearchResults();
    assert.equal(5, masterSearchResults.length);
  });

  it('Gets release search results', function () {
    const store = {
      getState: () => ({
        results: {
          releases: [{
            album: 1,
            page: {
              results: [{}]
            }
          }, {
            album: 1,
            page: {
              results: [{}, {},]
            }
          },]
        }
      })
    };
    const query = Query(1, store);
    const releaseSearchResults = query.getReleaseSearchResults();
    assert.equal(3, releaseSearchResults.length);
  });

  it('Gets retrieved releases', function () {
    const store = {
      getState: () => ({
        results: {
          masters: [{
            album: 1,
            page: {
              results: [{ id: 'm1' }]
            }
          },], releases: [{
            album: 1,
            page: {
              results: [{ id: 'r1' }]
            }
          },]
        },
        releases: [{ id: 'r1', master_id: 'm2' }, { id: 'r1', master_id: 'm1' },]
      })
    };
    const query = Query(1, store);
    const releases = query.getRetrievedReleases();
    assert.equal(2, releases.length);
  });

  it('Gets album', function () {
    const store = {
      getState: () => ({
        albums: [{id:1}]
      })
    };
    const query = Query(1, store);
    const album = query.getAlbum();
    assert(album);
  });
});