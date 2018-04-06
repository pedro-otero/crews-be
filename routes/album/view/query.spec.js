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
});