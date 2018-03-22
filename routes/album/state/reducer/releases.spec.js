const assert = require('assert');

const {
  ADD_MATCHES,
} = require('../action/constants');
const reduce = require('./releases');

describe('Releases reducer', function () {

  const addMatch = id => function () {
    this.releases = reduce([], {
      type: ADD_MATCHES,
      releases: [{ id }]
    });
  };

  describe(ADD_MATCHES, function () {
    beforeEach(addMatch('releaseId'));

    it('Pushes releases', function () {
      assert.equal(1, this.releases.length);
    });

    it('Creates a release with the given id', function () {
      assert.equal('releaseId', this.releases[0].id);
    });
  });
});
