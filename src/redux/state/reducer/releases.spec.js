const assert = require('assert');

const {
  ADD_RELEASE,
} = require('../action/constants');
const reduce = require('./releases');

describe('Releases reducer', () => {
  const addMatch = id => function () {
    this.releases = reduce([], {
      type: ADD_RELEASE,
      release: { id },
    });
  };

  describe(ADD_RELEASE, () => {
    beforeEach(addMatch('releaseId'));

    it('Pushes releases', function () {
      assert.equal(1, this.releases.length);
    });

    it('Creates a release with the given id', function () {
      assert.equal('releaseId', this.releases[0].id);
    });
  });
});
