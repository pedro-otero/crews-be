const assert = require('assert');

const {
  ADD_SEARCH,
} = require('../action/constants');
const reduce = require('./searches');

describe('Searches reducer', () => {
  const add = id => ({ type: ADD_SEARCH, id });
  const addSearch = id => function () {
    this.searches = reduce([], add(id));
    return this.searches;
  };

  describe(ADD_SEARCH, () => {
    beforeEach(addSearch('albumId'));

    it('Pushes searches', function () {
      assert.equal(1, this.searches.length);
    });

    it('Creates a request with the same id as the album', function () {
      assert.equal('albumId', this.searches[0].id);
    });

    it('Adds another search retaining the previous one', function () {
      let searches = reduce([], add('album'));
      searches = reduce(searches, add('otherAlbum'));
      assert.equal(2, searches.length);
    });
  });

  it('returns default state', () => {
    const searches = reduce(undefined, { type: 'nada' });
    assert(!searches.length);
  });
});
