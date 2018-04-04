const assert = require('assert');

const order = require('./order');

describe('Order search results function', function () {
  it('orders by exact title', function () {
    const ordered = order([{
      id: 1,
      title: 'An album whose exact title doesnt match'
    }, {
      id: 2,
      title: 'Artist - Album'
    }], {
      name: 'Album',
      artists: [{ name: 'Artist' }]
    });
    assert.equal(2, ordered[0].id);
  });
});