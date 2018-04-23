const assert = require('assert');

const {
  ADD_SEARCH,
  REMOVE_SEARCH,
  SET_LAST_SEARCH_PAGE,
  SET_LAST_RELEASE,
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

    it('Creates a search with the same id as the album', function () {
      assert.equal('albumId', this.searches[0].id);
    });

    it('Adds another search retaining the previous one', () => {
      let searches = reduce([], add('album'));
      searches = reduce(searches, add('otherAlbum'));
      assert.equal(2, searches.length);
    });
  });

  describe(SET_LAST_SEARCH_PAGE, () => {
    before(function () {
      this.searches = reduce([
        { id: 'albumId' },
        { id: 'otherAlbum' },
      ], {
        type: SET_LAST_SEARCH_PAGE,
        id: 'albumId',
        lastSearchPage: 'dummy',
      });
    });

    it('keeps the searches length', function () {
      assert.equal(this.searches.length, 2);
    });

    it('Sets the last search page retrieved', function () {
      assert.equal(this.searches[0].lastSearchPage, 'dummy');
    });

    it('Leaves other search unmodified', function () {
      assert(!this.searches[1].lastSearchPage);
    });
  });

  describe(SET_LAST_RELEASE, () => {
    before(function () {
      this.searches = reduce([
        { id: 'albumId' },
        { id: 'otherAlbum' },
      ], {
        type: SET_LAST_RELEASE,
        id: 'albumId',
        lastRelease: 'dummy',
      });
    });

    it('keeps the searches length', function () {
      assert.equal(this.searches.length, 2);
    });

    it('Sets the last search page retrieved', function () {
      assert.equal(this.searches[0].lastRelease, 'dummy');
    });

    it('Leaves other search unmodified', function () {
      assert(!this.searches[1].lastRelease);
    });
  });

  it('returns default state', () => {
    const searches = reduce(undefined, { type: 'nada' });
    assert(!searches.length);
  });

  it('returns default state', () => {
    const searches = reduce(undefined, { type: 'nada' });
    assert(!searches.length);
  });

  describe(REMOVE_SEARCH, () => {
    it('Removes searches from state', () => {
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
