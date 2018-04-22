const assert = require('assert');

const {
  ADD_CREDITS,
} = require('../action/constants');
const create = require('./credits');

describe('Credits action creator', () => {
  const album = {};

  describe('adds credits', () => {
    before(function () {
      const release = {};
      this.action = create(album, release);
    });

    it('type', function () {
      assert.equal(this.action.type, ADD_CREDITS);
    });
  });
});
