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

  describe('avoids duplicate credits', () => {
    const credits = reduce([{
      name: 'P1', role: 'R1', track: 'T1',
    }], {
      type: ADD_CREDITS,
      credits: [{
        name: 'P1', role: 'R1', track: 'T1',
      }],
    });

    it('test length', () => {
      assert.equal(credits.length, 1);
    });
  });
});
