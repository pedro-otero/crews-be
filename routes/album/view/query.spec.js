const assert = require('assert');

const Query = require('./query');

describe('Search state view', function () {
  beforeEach(function () {
    this.store = {
      getState: () => ({
        results: {
          masters: [{
            album: 1,
            page: {
              results: [{ id: 'a' }, {}, { id: 'c' },]
            }
          }, {
            album: 1,
            page: {
              results: [{}, {},]
            }
          },],
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
          },],
        },
        releases: [
          { id: 10, master_id: 'a' }, { id: 11, master_id: 'a' },
          { id: 12, master_id: 'c' }, { id: 13, master_id: 'd' },]
      })
    };
  });

  it('Gets master search results', function () {
    const query = Query(1, this.store);
    const masterSearchResults = query.getMasterSearchResults();
    assert.equal(5, masterSearchResults.length);
  });

  it('Gets release search results', function () {
    const query = Query(1, this.store);
    const releaseSearchResults = query.getReleaseSearchResults();
    assert.equal(3, releaseSearchResults.length);
  });
});