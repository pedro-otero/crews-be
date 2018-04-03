const assert = require('assert');

const reduce = require('./masters');

describe('Master search results reducer', () => {
  it('returns default state', () => {
    const results = reduce(undefined, {});
    assert.equal(0, results.length);
  });
});