const assert = require('assert');
const match = require('./tracklist');

describe('Tracklist comparator', () => {
  it('Different lengths', () => {
    assert.equal(match([
      { name: 'TrAck #1' },
      { name: 'TrAck #1' },
    ], [
      { title: 'Track #1' },
    ]), 0);
  });

  it('Exactly equal', () => {
    assert.equal(match([
      { name: 'TrAck #1' },
    ], [
      { title: 'Track #1' },
    ]), 1);
  });

  it('Not that equal', () => {
    assert(match([
      { name: '12345' },
    ], [
      { title: '12344' },
    ]) < 1);
  });
});
