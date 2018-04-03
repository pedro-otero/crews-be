const assert = require('assert');

const reduce = require('./masters');
const {
  ADD_MASTER_RESULTS
} = require('../../action/constants');

describe('Master search results reducer', () => {
  it('returns default state', () => {
    const results = reduce(undefined, {});
    assert.equal(0, results.length);
  });

  describe('store results for an album', () => {
    beforeEach(function () {
      this.results = reduce([], {
        type: ADD_MASTER_RESULTS,
        action: {
          album: 1,
          results: [{}],
        }
      });
    });

    it('stores one results object', function () {
      assert.equal(1, this.results.length);
    });
  });
});