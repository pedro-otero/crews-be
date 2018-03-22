const assert = require('assert');
const actions = require('../action/constants');

const searches = require('./searches');

describe('Searches reducer', function () {
  it('Adds a new search', function () {
    const newSearches = searches([], { type: actions.ADD_SEARCH, data: { album: {}}});
    assert.equal(1, newSearches.length);
  });
});