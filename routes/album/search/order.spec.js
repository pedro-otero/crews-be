const assert = require('assert');

const order = require('./order');

describe('Order search results function', function () {
  describe('orders by exact title', function () {
    beforeEach(function () {
      this.ordered = order([{
        id: 1,
        title: 'An album whose exact title doesnt match'
      }, {
        id: 2,
        title: 'Artist - Album'
      }], {
        name: 'Album',
        artists: [{ name: 'Artist' }]
      });
    });

    it('first item is release with id 2', function () {
      assert.equal(2, this.ordered[0].id);
    });
  });
});