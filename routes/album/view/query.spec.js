const assert = require('assert');

const Query = require('./query');

describe('Search state view', function () {
  beforeEach(function () {
    this.store = {
      getState: () => ({
        results: {
          masters: [{
            album: 1,
            page: {}
          }],
          releases: [{
            album: 1,
            page: {}
          }],
        }
      })
    };
    this.query = Query(1, this.store);
  });

  it('Gets master search results', function () {
    const masterSearchResults = this.query.getMasterSearchResults();
    assert.equal(1, masterSearchResults.length);
  });

  it('Gets release search results', function () {
    const releaseSearchResults = this.query.getReleaseSearchResults();
    assert.equal(1, releaseSearchResults.length);
  });
});