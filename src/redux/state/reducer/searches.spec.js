const assert = require('assert');

const {
  ADD_SEARCH,
  PUT_ERRORS,
  REMOVE_SEARCH,
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

    it('Creates a request with empty errors list', function () {
      assert.equal(0, this.searches[0].errors.length);
    });

    it('Adds another search retaining the previous one', () => {
      let searches = reduce([], add('album'));
      searches = reduce(searches, add('otherAlbum'));
      assert.equal(2, searches.length);
    });
  });

  describe(PUT_ERRORS, () => {
    describe('Puts errors in a search errors list', () => {
      before(function () {
        this.searches = reduce(this.searches, {
          type: PUT_ERRORS,
          id: 'albumId',
          errors: ['ERROR'],
        });
      });

      it('Preserves number of searches', function () {
        assert.equal(1, this.searches.length);
      });

      it('Puts error in list', function () {
        assert.equal('ERROR', this.searches[0].errors[0]);
      });
    });
  });

  describe(REMOVE_SEARCH, () => {
    it('Removes searches from state', function () {
      const searches = reduce([{ id: 'albumId' }], {
        type: REMOVE_SEARCH,
        id: 'albumId',
      });
      assert.equal(0, searches.length);
    });
  });

  it('returns default state', () => {
    const searches = reduce(undefined, { type: 'nada' });
    assert(!searches.length);
  });
});
