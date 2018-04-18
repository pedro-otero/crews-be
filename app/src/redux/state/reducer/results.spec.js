const assert = require('assert');

const reduce = require('./results');
const {
  ADD_RELEASE_RESULTS,
  REMOVE_RELEASE_RESULTS,
} = require('../action/constants');

describe('Release search results reducer', () => {
  it('returns default state', () => {
    const results = reduce(undefined, {});
    assert.equal(0, results.length);
  });

  it('removes results for an album', () => {
    const results = reduce([{ album: 2 }, { album: 1 }, { album: 2 }], {
      type: REMOVE_RELEASE_RESULTS,
      album: 2,
    });
    assert.equal(1, results.length);
  });

  describe('store results for an album', () => {
    beforeEach(function () {
      this.results = reduce([], {
        type: ADD_RELEASE_RESULTS,
        album: 1,
        page: { results: [{}] },
      });
    });

    it('stores one results object', function () {
      assert.equal(1, this.results.length);
    });

    it('stores a results object for the indicated album', function () {
      assert.equal(1, this.results[0].album);
    });

    it('stores a results object with the indicated results', function () {
      assert.equal(1, this.results[0].page.results.length);
    });
  });
});
