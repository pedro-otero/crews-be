const assert = require('assert');

const Query = require('./index');
const mockState = require('./mock-state');

describe('Query', () => {
  before(function () {
    this.state = mockState;
  });

  const test = (id, cause, progress) => {
    context(cause, () => {
      before(function () {
        this.query = Query(this.state)(id);
      });

      it('has correct id', function () {
        assert.equal(this.query.id, id);
      });

      it(`has progress = ${progress}`, function () {
        assert.equal(this.query.progress, progress);
      });
    });
  };

  test('query-progress-0-no-retrieved-releases', 'progress 0 because no retrieved releases', 0);
  test('progress-0-no-search-results-retrieved', 'progress 0 because of no search results retrieved yet', 0);
  test('progress-100-no-search-results-found', 'progress-100-no-search-results-found', 100);
  test('partial-one-page-50%', 'partial, one page, 50%', 50);
  test('partial-2p-1-fully-loaded-67%', 'partial, two pages, one fully loaded, 67%', 67);
  test('partial-2p-1-fully-loaded-second-partially-75%', 'partial, two pages, one fully loaded, second partially, 75%', 75);
  test('full', 'full', 100);

  it('safely finds no match', function () {
    const query = Query(this.state)('query-no-match');
    assert(query.bestMatch);
  });

  it('returns null if there is no album data', function () {
    const query = Query(this.state)('nothing');
    assert(query === null);
  });
});
