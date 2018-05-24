const assert = require('assert');

const reduce = require('./merge');

describe('Credit reducer', () => {
  describe('adds credits', () => {
    const credits = reduce(
      [],
      [{ name: 'x', role: 'y', track: 'z' }]
    );

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
    }, {
      name: 'Pé5', role: 'R5', track: 'T5',
    }, {
      name: 'Pe6', role: 'R6', track: 'T6',
    }], [{
      name: 'Pé1', role: 'R1', track: 'T1',
    }, {
      name: 'Pe2', role: 'R2', track: 'T2',
    }, {
      name: 'P4', role: 'R4', track: 'T4',
    }, {
      name: 'P3', role: 'R3', track: 'T4',
    }, {
      name: 'P3', role: 'R3', track: 'T4',
    }, {
      name: 'Pé5', role: 'R5', track: 'T5',
    }, {
      name: 'Pe6', role: 'R6', track: 'T6',
    }]);

    it('test length', () => {
      assert.equal(credits.length, 7);
    });

    it('has accented Pe1', () => {
      assert(credits.find(c => c.name === 'Pé1' && c.role === 'R1' && c.track === 'T1'));
    });

    it('has NOT unaccented Pe1', () => {
      assert(!credits.find(c => c.name === 'Pe1' && c.role === 'R1' && c.track === 'T1'));
    });

    it('has accented Pe2', () => {
      assert(credits.find(c => c.name === 'Pé2' && c.role === 'R2' && c.track === 'T2'));
    });

    it('has NOT unaccented Pe2', () => {
      assert(!credits.find(c => c.name === 'Pe2' && c.role === 'R2' && c.track === 'T2'));
    });

    it('adds credits that have no equivalent accented or not', () => {
      assert(credits.find(c => c.name === 'P3' && c.role === 'R3' && c.track === 'T3'));
    });

    it('keeps credits that have no equivalent accented or not', () => {
      assert(credits.find(c => c.name === 'P4' && c.role === 'R4' && c.track === 'T4'));
    });

    it('compares credits by the role when name is the same', () => {
      assert(credits.find(c => c.name === 'P3' && c.role === 'R3' && c.track === 'T4'));
    });

    it('has only one Pé5', () => {
      assert.equal(credits.filter(c => c.name === 'Pé5' && c.role === 'R5' && c.track === 'T5').length, 1);
    });

    it('has only one Pe6', () => {
      assert.equal(credits.filter(c => c.name === 'Pe6' && c.role === 'R6' && c.track === 'T6').length, 1);
    });
  });
});
