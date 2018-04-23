const assert = require('assert');

const { ADD_SEARCH } = require('./constants');
const create = require('./searches');

describe('Searches action creators', () => {
  context('creates add search action', () => {
    before(function () {
      this.action = create.addSearch(1);
    });

    it('sets ADD_SEARCH type', function () {
      assert.equal(this.action.type, ADD_SEARCH);
    });

    it('sets id', function () {
      assert.equal(this.action.id, 1);
    });
  });
});
