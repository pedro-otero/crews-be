const assert = require('assert');

const { ADD_SEARCH } = require('./constants');
const create = require('./creators');

describe('Searches action creators', () => {
  context('creates add search action', () => {
    const action = create.addSearch(1);
    it('sets ADD_SEARCH type', () => {
      assert.equal(action.type, ADD_SEARCH);
    });
  });
});
