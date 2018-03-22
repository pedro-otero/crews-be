const assert = require('assert');

const {
  ADD_SEARCH,
  ADD_MATCHES,
  SET_STATUS,
  RESULTS,
} = require('../action/constants');
const reduce = require('./searches');

describe('Searches reducer', function () {

  const addSearch = id => function () {
    this.searches = reduce([], {
      type: ADD_SEARCH,
      id
    });
  };

  describe(ADD_SEARCH, function () {
    beforeEach(addSearch('albumId'));

    it('Pushes searches', function () {
      assert.equal(1, this.searches.length);
    });

    it('Creates a request with the same id as the album', function () {
      assert.equal('albumId', this.searches[0].id);
    });

    it('Creates a request with status ADDED', function () {
      assert.equal('ADDED', this.searches[0].status);
    });
  });

  describe(ADD_MATCHES, function () {
    beforeEach(function () {
      this.searches = reduce([{
        id: 'albumId',
      }], {
        type: ADD_MATCHES,
        album: {
          id: 'albumId',
          artists: [{ name: 'who' }],
          tracks: {
            items: []
          },
        },
        releases: [{
          id: 1
        }]
      })
    });

    it('puts one match in the search', function () {
      assert.equal(1, this.searches[0].matches.length);
    });

    it('matches release to the search by album id', function () {
      assert.equal(1, this.searches[0].matches[0]);
    });

    it('sets search as MATCHED', function () {
      assert.equal('MATCHED', this.searches[0].status);
    });

    it('sets search\s builtAlbum', function () {
      assert(this.searches[0].builtAlbum);
    });
  });

  describe(SET_STATUS, function () {
    it('sets the status', function () {
      const searches = reduce([{
        id: 'albumId',
      }], {
        type: SET_STATUS,
        id: 'albumId',
        status: 'some status'
      });
      assert.equal('some status', searches[0].status);
    });
  });

  describe(RESULTS, function () {
    beforeEach(function () {
      this.searches = reduce([{
        id: 1
      }], {
        type: RESULTS,
        entity: 'master',
        results: []
      });
    });

    it('sets master results in the search', function () {
      assert(this.searches[0].masterResults);
    });
  });

  it('returns default state', function () {
    const searches = reduce(undefined, { type: 'nada' });
    assert(!searches.length);
  });
});
