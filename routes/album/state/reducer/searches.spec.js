const assert = require('assert');

const actions = require('../action/constants');
const searches = require('./searches');

describe('Searches reducer', function () {
  beforeEach(function () {
    this.newSearches = searches([], {
      type: actions.ADD_SEARCH,
      id: 'albumId'
    });
  });

  it('Pushes searches', function () {
    assert.equal(1, this.newSearches.length);
  });

  it('Creates a request with the same id as the album', function () {
    assert.equal('albumId', this.newSearches[0].id);
  });

  it('Creates a request with status ADDED', function () {
    assert.equal('ADDED', this.newSearches[0].status);
  });
});