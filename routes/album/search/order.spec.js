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

    it('second item is release with id 1', function () {
      assert.equal(1, this.ordered[1].id);
    });

    it('preserves array length', function () {
      assert.equal(2, this.ordered.length);
    });
  });
});