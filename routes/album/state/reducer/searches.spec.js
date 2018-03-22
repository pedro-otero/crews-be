const assert = require('assert');

const actions = require('../action/constants');
const searches = require('./searches');

describe('Searches reducer', function () {
  beforeEach(function () {
    this.newSearches = searches([], { type: actions.ADD_SEARCH, data: { album: {} } });
  });

  it('Adds a new search', function () {
    assert.equal(1, this.newSearches.length);
  });
});