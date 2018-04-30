const assert = require('assert');

const {
  ADD_ALBUM,
} = require('./constants');
const create = require('./albums');

describe('Albums action creators', () => {
  context('creates add album action', () => {
    before(function () {
      this.action = create({ id: 1 });
    });

    it('sets ADD_ALBUM type', function () {
      assert.equal(this.action.type, ADD_ALBUM);
    });

    it('sets album', function () {
      assert.equal(this.action.album.id, 1);
    });
  });
});
