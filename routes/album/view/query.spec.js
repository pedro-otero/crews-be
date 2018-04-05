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
          }]
        }
      })
    };
  });

  it('Gets master search results', function () {
    const query = Query(1, this.store);
    const masterSearchResults = query.getMasterSearchResults();
    assert.equal(1, masterSearchResults.length);
  });
});