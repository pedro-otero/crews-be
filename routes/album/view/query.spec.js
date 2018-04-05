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
              results: [{ id: 'a' }, { id: 'b' }, { id: 'c' },]
            }
          }, {
            album: 1,
            page: {
              results: [{ id: 'd' }, { id: 'e' },]
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
              results: [{},{},]
            }
          },],
        }
      })
    };
    this.query = Query(1, this.store);
  });

  it('Gets master search results', function () {
    const masterSearchResults = this.query.getMasterSearchResults();
    assert.equal(5, masterSearchResults.length);
  });

  it('Gets release search results', function () {
    const releaseSearchResults = this.query.getReleaseSearchResults();
    assert.equal(3, releaseSearchResults.length);
  });
});