const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const reduce = require('./credits');

describe('Credit reducer', () => {
  describe('adds credits', () => {
    const credits = reduce([], {
      type: ADD_CREDITS,
      credits: ['value'],
    });

    it('test length', () => {
      assert.equal(credits.length, 1);
    });

    it('test value', () => {
      assert.equal(credits[0], 'value');
    });
  });
});
