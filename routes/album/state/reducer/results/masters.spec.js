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

  it('stores results for an album', () => {
    const results = reduce([], {
      type: ADD_MASTER_RESULTS,
      action: {
        album: 1,
        results: [{}],
      }
    });
    assert.equal(1, results.length);
  });
});