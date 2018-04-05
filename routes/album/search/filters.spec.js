const assert = require('assert');
const match = require('./filters');

describe('Tracklist comparator', function () {

  it('Exactly equal', function () {
    assert.equal(match([
        { name: 'TrAck #1' },
      ], [
        { title: 'Track #1' },
      ]
    ), 1);
  });

  it('Not that equal', function () {
    assert(match([
        { name: '12345' },
      ], [
        { title: '12344' },
      ]
    ) < 1);
  });

});