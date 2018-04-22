const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const reduce = require('./credits');

describe('Credit reducer', () => {
  it('adds credits', () => {
    const credits = reduce([], {
      type: ADD_CREDITS,
      credits: ['value'],
    });
    assert.equal(credits.length, 1);
  });
});
