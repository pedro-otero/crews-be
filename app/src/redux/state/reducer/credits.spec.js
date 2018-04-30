const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const reduce = require('./credits');

describe('Credit reducer', () => {
  describe('adds credits', () => {
    const credits = reduce([], {
      type: ADD_CREDITS,
      credits: [{ name: 'x', role: 'y', track: 'z' }],
    });

    it('test length', () => {
      assert.equal(credits.length, 1);
    });

    it('test value', () => {
      assert.equal(credits[0].name, 'x');
    });
  });

  describe('avoids duplicate credits', () => {
    const credits = reduce([{
      name: 'Pe1', role: 'R1', track: 'T1',
    }, {
      name: 'Pé2', role: 'R2', track: 'T2',
    }, {
      name: 'P3', role: 'R3', track: 'T3',
    }], {
      type: ADD_CREDITS,
      credits: [{
        name: 'Pé1', role: 'R1', track: 'T1',
      }, {
        name: 'Pe2', role: 'R2', track: 'T2',
      }, {
        name: 'P4', role: 'R4', track: 'T4',
      }],
    });

    it('test length', () => {
      assert.equal(credits.length, 4);
    });

    describe('but prefers accented version', () => {
      it('of Pe', () => {
        assert(!credits.find(c => c.name === 'Pe1' && c.role === 'R1' && c.track === 'T1'));
      });

      it('of Re', () => {
        assert(!credits.find(c => c.name === 'P2' && c.role === 'Re2' && c.track === 'T2'));
      });
    });

    it('adds credits that have no equivalent accented or not', () => {
      assert(credits.find(c => c.name === 'P3' && c.role === 'R3' && c.track === 'T3'));
    });

    it('keeps credits that have no equivalent accented or not', () => {
      assert(credits.find(c => c.name === 'P4' && c.role === 'R4' && c.track === 'T4'));
    });
  });
});
