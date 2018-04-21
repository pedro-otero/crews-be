const assert = require('assert');

const Query = require('./query');

describe('Search state view', () => {
  describe('gets search query object', () => {
    it('progress 0 because of no retrieved releases', function () {
      const query = Query(this.store)('query-progress-0-no-retrieved-releases');
      assert.equal(query.progress, 0);
    });

    it('progress 0 because of no search results', function () {
      const query = Query(this.store)('progress-0-no-search-results');
      assert.equal(query.progress, 0);
    });

    it('partial, one page, 50%', function () {
      const query = Query(this.store)('partial-one-page-50%');
      assert.equal(query.progress, 50);
    });

    it('partial, two pages, one fully loaded, 67%', function () {
      const query = Query(this.store)('partial-2p-1-fully-loaded-67%');
      assert.equal(query.progress, 67);
    });

    it('partial, two pages, one fully loaded, second partially, 75%', function () {
      const query = Query(this.store)('partial-2p-1-fully-loaded-second-partially-75%');
      assert.equal(query.progress, 75);
    });

    it('full', function () {
      const query = Query(this.store)('full');
      assert.equal(query.progress, 100);
    });

    it('picks the best match', function () {
      const query = Query(this.store)('query-pick-best-match');
      assert.equal(query.bestMatch.tracks[0].producers[0], 'some guy');
    });

    it('safely finds no match', function () {
      const query = Query(this.store)('query-no-match');
      assert.equal(query.bestMatch, null);
    });

    it('returns null if there is no album data', function () {
      const query = Query(this.store)('nothing');
      assert(query === null);
    });
  });
});
